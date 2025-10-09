import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '@/models/CategoryModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';

export class CategoryController {
  private categoryModel: CategoryModel;
  private logger: Logger;

  constructor() {
    this.categoryModel = new CategoryModel();
    this.logger = new Logger();
  }

  public async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoryModel.findMany({ isActive: true });
      res.status(200).json({
        success: true,
        data: { categories: categories.data },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryModel.findById(id);
      
      if (!category) {
        throw ErrorHandler.createError('Category not found', 404);
      }

      res.status(200).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  public async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await this.categoryModel.createCategory(req.body);

      this.logger.info('Category created successfully', {
        categoryId: category.id,
        name: category.name,
        createdBy: req.user!.id,
      });

      res.status(201).json({
        success: true,
        data: { category },
        message: 'Category created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryModel.updateCategory(id, req.body);

      this.logger.info('Category updated successfully', {
        categoryId: category.id,
        name: category.name,
        updatedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        data: { category },
        message: 'Category updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryModel.softDelete(id);

      this.logger.info('Category deleted successfully', {
        categoryId: category.id,
        name: category.name,
        deletedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
