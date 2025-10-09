import { Request, Response, NextFunction } from 'express';
import { UserModel } from '@/models/UserModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';

export class UserController {
  private userModel: UserModel;
  private logger: Logger;

  constructor() {
    this.userModel = new UserModel();
    this.logger = new Logger();
  }

  public async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, role, isActive } = req.query;
      const pagination = (req as any).pagination;

      let where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { username: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const { data, total } = await this.userModel.findMany(where, {
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      });

      res.status(200).json({
        success: true,
        data: {
          users: data,
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

  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userModel.findById(id);

      if (!user) {
        throw ErrorHandler.createError('User not found', 404);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: { user: userWithoutPassword },
      });
    } catch (error) {
      next(error);
    }
  }

  public async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userModel.createUser(req.body);

      this.logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
        createdBy: req.user!.id,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        data: { user: userWithoutPassword },
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userModel.updateUser(id, req.body);

      this.logger.info('User updated successfully', {
        userId: user.id,
        email: user.email,
        updatedBy: req.user!.id,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: { user: userWithoutPassword },
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userModel.softDelete(id);

      this.logger.info('User deleted successfully', {
        userId: user.id,
        email: user.email,
        deletedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.params;
      const { limit = 20 } = req.query;

      const users = await this.userModel.searchUsers(
        query,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.userModel.getUserStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

}
