"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const CustomerModel_1 = require("@/models/CustomerModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
const DatabaseService_1 = require("@/services/DatabaseService");
class CustomerController {
    constructor() {
        this.customerModel = new CustomerModel_1.CustomerModel();
        this.logger = new Logger_1.Logger();
    }
    async getCustomers(req, res, next) {
        try {
            const { search, isActive } = req.query;
            const pagination = req.pagination;
            let where = {};
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }
            const { data, total } = await this.customerModel.findMany(where, {
                skip: pagination.offset,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
            });
            res.status(200).json({
                success: true,
                data: {
                    customers: data,
                    pagination: {
                        page: pagination.page,
                        limit: pagination.limit,
                        total,
                        pages: Math.ceil(total / pagination.limit),
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCustomerById(req, res, next) {
        try {
            const { id } = req.params;
            const customer = await this.customerModel.findById(id);
            if (!customer) {
                throw ErrorHandler_1.ErrorHandler.createError('Customer not found', 404);
            }
            res.status(200).json({
                success: true,
                data: { customer },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createCustomer(req, res, next) {
        try {
            let createdBy = req.user?.id;
            if (!createdBy) {
                const prisma = DatabaseService_1.DatabaseService.getInstance().getClient();
                const anyUser = await prisma.user.findFirst({
                    where: { isActive: true },
                    select: { id: true }
                });
                createdBy = anyUser?.id || 'system';
            }
            const customerData = {
                ...req.body,
                createdBy,
            };
            const customer = await this.customerModel.createCustomer(customerData);
            this.logger.info('Customer created successfully', {
                customerId: customer.id,
                name: `${customer.firstName} ${customer.lastName}`,
                createdBy,
            });
            res.status(201).json({
                success: true,
                data: { customer },
                message: 'Customer created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateCustomer(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const customer = await this.customerModel.updateCustomer(id, updateData);
            this.logger.info('Customer updated successfully', {
                customerId: customer.id,
                name: `${customer.firstName} ${customer.lastName}`,
                updatedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { customer },
                message: 'Customer updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCustomer(req, res, next) {
        try {
            const { id } = req.params;
            const customer = await this.customerModel.softDelete(id);
            this.logger.info('Customer deleted successfully', {
                customerId: customer.id,
                name: `${customer.firstName} ${customer.lastName}`,
                deletedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: 'Customer deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async searchCustomers(req, res, next) {
        try {
            const { query } = req.params;
            const { limit = 20 } = req.query;
            const customers = await this.customerModel.searchCustomers(query, parseInt(limit));
            res.status(200).json({
                success: true,
                data: { customers },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCustomerMeasurements(req, res, next) {
        try {
            const { id } = req.params;
            const measurements = await this.customerModel.getCustomerMeasurements(id);
            res.status(200).json({
                success: true,
                data: { measurements },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addCustomerMeasurement(req, res, next) {
        try {
            const { id } = req.params;
            const measurementData = req.body;
            const measurement = await this.customerModel.addCustomerMeasurement(id, measurementData);
            this.logger.info('Customer measurement added successfully', {
                customerId: id,
                measurementId: measurement.id,
                name: measurement.name,
                addedBy: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { measurement },
                message: 'Measurement added successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateCustomerMeasurement(req, res, next) {
        try {
            const { id, measurementId } = req.params;
            const updateData = req.body;
            const measurement = await this.customerModel.updateCustomerMeasurement(id, measurementId, updateData);
            this.logger.info('Customer measurement updated successfully', {
                customerId: id,
                measurementId: measurement.id,
                updatedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { measurement },
                message: 'Measurement updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCustomerMeasurement(req, res, next) {
        try {
            const { id, measurementId } = req.params;
            await this.customerModel.deleteCustomerMeasurement(id, measurementId);
            this.logger.info('Customer measurement deleted successfully', {
                customerId: id,
                measurementId,
                deletedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: 'Measurement deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCustomerBills(req, res, next) {
        try {
            const { id } = req.params;
            const pagination = req.pagination;
            const bills = await this.customerModel.getCustomerBills(id, {
                skip: pagination.offset,
                take: pagination.limit,
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json({
                success: true,
                data: { bills },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCustomerStats(req, res, next) {
        try {
            const stats = await this.customerModel.getCustomerStats();
            res.status(200).json({
                success: true,
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CustomerController = CustomerController;
//# sourceMappingURL=CustomerController.js.map