import { Request, Response, NextFunction } from 'express';
import { CustomerModel } from '@/models/CustomerModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';
import { DatabaseService } from '@/services/DatabaseService';

export class CustomerController {
  private customerModel: CustomerModel;
  private logger: Logger;

  constructor() {
    this.customerModel = new CustomerModel();
    this.logger = new Logger();
  }

  public async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, isActive } = req.query;
      const pagination = (req as any).pagination;

      let where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
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
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerModel.findById(id);

      if (!customer) {
        throw ErrorHandler.createError('Customer not found', 404);
      }

      res.status(200).json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  }

  public async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let createdBy = req.user?.id;

      // If no user is authenticated, try to find admin user as fallback
      if (!createdBy) {
        const prisma = DatabaseService.getInstance().getClient();
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
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const customer = await this.customerModel.updateCustomer(id, updateData);

      this.logger.info('Customer updated successfully', {
        customerId: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        updatedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        data: { customer },
        message: 'Customer updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerModel.softDelete(id);

      this.logger.info('Customer deleted successfully', {
        customerId: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        deletedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async searchCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.params;
      const { limit = 20 } = req.query;

      const customers = await this.customerModel.searchCustomers(
        query,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: { customers },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerMeasurements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const measurements = await this.customerModel.getCustomerMeasurements(id);

      res.status(200).json({
        success: true,
        data: { measurements },
      });
    } catch (error) {
      next(error);
    }
  }

  public async addCustomerMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const measurementData = req.body;

      const measurement = await this.customerModel.addCustomerMeasurement(id, measurementData);

      this.logger.info('Customer measurement added successfully', {
        customerId: id,
        measurementId: measurement.id,
        name: measurement.name,
        addedBy: req.user!.id,
      });

      res.status(201).json({
        success: true,
        data: { measurement },
        message: 'Measurement added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateCustomerMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, measurementId } = req.params;
      const updateData = req.body;

      const measurement = await this.customerModel.updateCustomerMeasurement(id, measurementId, updateData);

      this.logger.info('Customer measurement updated successfully', {
        customerId: id,
        measurementId: measurement.id,
        updatedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        data: { measurement },
        message: 'Measurement updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCustomerMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, measurementId } = req.params;
      await this.customerModel.deleteCustomerMeasurement(id, measurementId);

      this.logger.info('Customer measurement deleted successfully', {
        customerId: id,
        measurementId,
        deletedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        message: 'Measurement deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerBills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pagination = (req as any).pagination;

      const bills = await this.customerModel.getCustomerBills(id, {
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: { bills },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCustomerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.customerModel.getCustomerStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}
