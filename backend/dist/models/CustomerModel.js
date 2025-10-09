"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class CustomerModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'customer';
    }
    async createCustomer(data) {
        try {
            if (data.email || data.phone) {
                const existingCustomer = await this.findByEmailOrPhone(data.email, data.phone);
                if (existingCustomer) {
                    throw ErrorHandler_1.ErrorHandler.createError('Customer with this email or phone already exists', 409);
                }
            }
            const customer = await this.create(data);
            this.logOperation('CREATE', { id: customer.id, name: `${customer.firstName} ${customer.lastName}` });
            return customer;
        }
        catch (error) {
            this.logger.error('Error creating customer:', error);
            throw error;
        }
    }
    async updateCustomer(id, data) {
        try {
            if (data.email || data.phone) {
                const existingCustomer = await this.findByEmailOrPhone(data.email, data.phone);
                if (existingCustomer && existingCustomer.id !== id) {
                    throw ErrorHandler_1.ErrorHandler.createError('Customer with this email or phone already exists', 409);
                }
            }
            const customer = await this.update(id, data);
            this.logOperation('UPDATE', { id: customer.id, name: `${customer.firstName} ${customer.lastName}` });
            return customer;
        }
        catch (error) {
            this.logger.error('Error updating customer:', error);
            throw error;
        }
    }
    async findByEmailOrPhone(email, phone) {
        try {
            if (!email && !phone) {
                return null;
            }
            const where = {
                OR: [],
            };
            if (email) {
                where.OR.push({ email });
            }
            if (phone) {
                where.OR.push({ phone });
            }
            const customer = await this.prisma.customer.findFirst({ where });
            return customer;
        }
        catch (error) {
            this.logger.error('Error finding customer by email or phone:', error);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const customer = await this.prisma.customer.findFirst({
                where: { email },
            });
            return customer;
        }
        catch (error) {
            this.logger.error('Error finding customer by email:', error);
            throw error;
        }
    }
    async findByPhone(phone) {
        try {
            const customer = await this.prisma.customer.findFirst({
                where: { phone },
            });
            return customer;
        }
        catch (error) {
            this.logger.error('Error finding customer by phone:', error);
            throw error;
        }
    }
    async searchCustomers(query, limit = 20) {
        try {
            const customers = await this.prisma.customer.findMany({
                where: {
                    AND: [
                        { isActive: true },
                        {
                            OR: [
                                { firstName: { contains: query } },
                                { lastName: { contains: query } },
                                { email: { contains: query } },
                                { phone: { contains: query } },
                            ],
                        },
                    ],
                },
                take: limit,
                orderBy: { firstName: 'asc' },
            });
            return customers;
        }
        catch (error) {
            this.logger.error('Error searching customers:', error);
            throw error;
        }
    }
    async getCustomerMeasurements(customerId) {
        try {
            const measurements = await this.prisma.customerMeasurement.findMany({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
            });
            return measurements;
        }
        catch (error) {
            this.logger.error('Error getting customer measurements:', error);
            throw error;
        }
    }
    async addCustomerMeasurement(customerId, data) {
        try {
            const measurement = await this.prisma.customerMeasurement.create({
                data: {
                    customerId,
                    name: data.name,
                    measurements: data.measurements,
                    notes: data.notes,
                },
            });
            this.logOperation('CREATE_MEASUREMENT', {
                customerId,
                measurementId: measurement.id,
                name: measurement.name
            });
            return measurement;
        }
        catch (error) {
            this.logger.error('Error adding customer measurement:', error);
            throw error;
        }
    }
    async updateCustomerMeasurement(customerId, measurementId, data) {
        try {
            const measurement = await this.prisma.customerMeasurement.update({
                where: {
                    id: measurementId,
                    customerId,
                },
                data,
            });
            this.logOperation('UPDATE_MEASUREMENT', {
                customerId,
                measurementId: measurement.id,
                name: measurement.name
            });
            return measurement;
        }
        catch (error) {
            this.logger.error('Error updating customer measurement:', error);
            throw error;
        }
    }
    async deleteCustomerMeasurement(customerId, measurementId) {
        try {
            await this.prisma.customerMeasurement.delete({
                where: {
                    id: measurementId,
                    customerId,
                },
            });
            this.logOperation('DELETE_MEASUREMENT', {
                customerId,
                measurementId
            });
        }
        catch (error) {
            this.logger.error('Error deleting customer measurement:', error);
            throw error;
        }
    }
    async getCustomerBills(customerId, options = {}) {
        try {
            const bills = await this.prisma.bill.findMany({
                where: { customerId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                    payments: true,
                },
                ...options,
            });
            return bills;
        }
        catch (error) {
            this.logger.error('Error getting customer bills:', error);
            throw error;
        }
    }
    async getCustomerStats() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const [total, active, newThisMonth, topCustomersData] = await Promise.all([
                this.count(),
                this.count({ isActive: true }),
                this.count({
                    isActive: true,
                    createdAt: { gte: startOfMonth },
                }),
                this.prisma.bill.groupBy({
                    by: ['customerId'],
                    where: {
                        customer: { isActive: true },
                        status: 'ACTIVE',
                    },
                    _sum: { finalAmount: true },
                    _count: { id: true },
                    orderBy: { _sum: { finalAmount: 'desc' } },
                    take: 10,
                }),
            ]);
            const topCustomers = await Promise.all(topCustomersData.map(async (item) => {
                const customer = item.customerId ? await this.findById(item.customerId) : null;
                return {
                    customer: customer,
                    totalSpent: Number(item._sum.finalAmount) || 0,
                    billCount: item._count.id,
                };
            }));
            return {
                total,
                active,
                newThisMonth,
                topCustomers,
            };
        }
        catch (error) {
            this.logger.error('Error getting customer stats:', error);
            throw error;
        }
    }
}
exports.CustomerModel = CustomerModel;
//# sourceMappingURL=CustomerModel.js.map