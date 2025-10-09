import { Router } from 'express';
import { body, param } from 'express-validator';
import { CategoryController } from '@/controllers/CategoryController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class CategoryRoutes {
    private router: Router;
    private categoryController: CategoryController;

    constructor() {
        this.router = Router();
        this.categoryController = new CategoryController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get all categories
        this.router.get(
            '/',
            this.categoryController.getCategories.bind(this.categoryController)
        );

        // Get category by ID
        this.router.get(
            '/:id',
            [
                param('id').isString().withMessage('Category ID is required'),
            ],
            ValidationMiddleware.validate,
            this.categoryController.getCategoryById.bind(this.categoryController)
        );

        // Create new category
        this.router.post(
            '/',
            [
                body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name is required and must be less than 100 characters'),
                body('description').optional().isString().withMessage('Description must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.categoryController.createCategory.bind(this.categoryController)
        );

        // Update category
        this.router.put(
            '/:id',
            [
                param('id').isString().withMessage('Category ID is required'),
                body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Category name must be less than 100 characters'),
                body('description').optional().isString().withMessage('Description must be a string'),
                body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.categoryController.updateCategory.bind(this.categoryController)
        );

        // Delete category
        this.router.delete(
            '/:id',
            [
                param('id').isString().withMessage('Category ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.categoryController.deleteCategory.bind(this.categoryController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
