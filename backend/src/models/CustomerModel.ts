import { Customer, Gender, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface CreateCustomerData {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    createdBy: string;
}

export interface UpdateCustomerData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    isActive?: boolean;
}

export interface CreateMeasurementData {
    name: string;
    measurements: any;
    notes?: string;
}

export interface UpdateMeasurementData {
    name?: string;
    measurements?: any;
    notes?: string;
}

export class CustomerModel extends BaseModel<Customer> {
    getTableName(): string {
        return 'customer';
    }

    public async createCustomer(data: CreateCustomerData): Promise<Customer> {
        try {
            // Check if customer with same email or phone already exists
            if (data.email || data.phone) {
                const existingCustomer = await this.findByEmailOrPhone(data.email, data.phone);
                if (existingCustomer) {
                    throw ErrorHandler.createError('Customer with this email or phone already exists', 409);
                }
            }

            const customer = await this.create(data);
            this.logOperation('CREATE', { id: customer.id, name: `${customer.firstName} ${customer.lastName}` });
            return customer;
        } catch (error) {
            this.logger.error('Error creating customer:', error);
            throw error;
        }
    }

    public async updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer> {
        try {
            // Check if email or phone is being changed and if it already exists
            if (data.email || data.phone) {
                const existingCustomer = await this.findByEmailOrPhone(data.email, data.phone);
                if (existingCustomer && existingCustomer.id !== id) {
                    throw ErrorHandler.createError('Customer with this email or phone already exists', 409);
                }
            }

            const customer = await this.update(id, data);
            this.logOperation('UPDATE', { id: customer.id, name: `${customer.firstName} ${customer.lastName}` });
            return customer;
        } catch (error) {
            this.logger.error('Error updating customer:', error);
            throw error;
        }
    }

    public async findByEmailOrPhone(email?: string, phone?: string): Promise<Customer | null> {
        try {
            if (!email && !phone) {
                return null;
            }

            const where: Prisma.CustomerWhereInput = {
                OR: [],
            };

            if (email) {
                where.OR!.push({ email });
            }

            if (phone) {
                where.OR!.push({ phone });
            }

            const customer = await this.prisma.customer.findFirst({ where });
            return customer;
        } catch (error) {
            this.logger.error('Error finding customer by email or phone:', error);
            throw error;
        }
    }

    public async findByEmail(email: string): Promise<Customer | null> {
        try {
            const customer = await this.prisma.customer.findFirst({
                where: { email },
            });
            return customer;
        } catch (error) {
            this.logger.error('Error finding customer by email:', error);
            throw error;
        }
    }

    public async findByPhone(phone: string): Promise<Customer | null> {
        try {
            const customer = await this.prisma.customer.findFirst({
                where: { phone },
            });
            return customer;
        } catch (error) {
            this.logger.error('Error finding customer by phone:', error);
            throw error;
        }
    }

    public async searchCustomers(query: string, limit: number = 20): Promise<Customer[]> {
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
        } catch (error) {
            this.logger.error('Error searching customers:', error);
            throw error;
        }
    }

    public async getCustomerMeasurements(customerId: string): Promise<any[]> {
        try {
            const measurements = await this.prisma.customerMeasurement.findMany({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
            });

            return measurements;
        } catch (error) {
            this.logger.error('Error getting customer measurements:', error);
            throw error;
        }
    }

    public async addCustomerMeasurement(customerId: string, data: CreateMeasurementData): Promise<any> {
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
        } catch (error) {
            this.logger.error('Error adding customer measurement:', error);
            throw error;
        }
    }

    public async updateCustomerMeasurement(
        customerId: string,
        measurementId: string,
        data: UpdateMeasurementData
    ): Promise<any> {
        try {
            const measurement = await this.prisma.customerMeasurement.update({
                where: {
                    id: measurementId,
                    customerId, // Ensure measurement belongs to customer
                },
                data,
            });

            this.logOperation('UPDATE_MEASUREMENT', {
                customerId,
                measurementId: measurement.id,
                name: measurement.name
            });
            return measurement;
        } catch (error) {
            this.logger.error('Error updating customer measurement:', error);
            throw error;
        }
    }

    public async deleteCustomerMeasurement(customerId: string, measurementId: string): Promise<void> {
        try {
            await this.prisma.customerMeasurement.delete({
                where: {
                    id: measurementId,
                    customerId, // Ensure measurement belongs to customer
                },
            });

            this.logOperation('DELETE_MEASUREMENT', {
                customerId,
                measurementId
            });
        } catch (error) {
            this.logger.error('Error deleting customer measurement:', error);
            throw error;
        }
    }

    public async getCustomerBills(customerId: string, options: any = {}): Promise<any[]> {
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
        } catch (error) {
            this.logger.error('Error getting customer bills:', error);
            throw error;
        }
    }

    public async getCustomerStats(): Promise<{
        total: number;
        active: number;
        newThisMonth: number;
        topCustomers: Array<{ customer: Customer; totalSpent: number; billCount: number }>;
    }> {
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

            const topCustomers = await Promise.all(
                topCustomersData.map(async (item) => {
                    const customer = item.customerId ? await this.findById(item.customerId) : null;
                    return {
                        customer: customer!,
                        totalSpent: Number(item._sum.finalAmount) || 0,
                        billCount: item._count.id,
                    };
                })
            );

            return {
                total,
                active,
                newThisMonth,
                topCustomers,
            };
        } catch (error) {
            this.logger.error('Error getting customer stats:', error);
            throw error;
        }
    }
}
