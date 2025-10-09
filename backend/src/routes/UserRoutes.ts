import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { UserController } from '@/controllers/UserController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class UserRoutes {
    private router: Router;
    private userController: UserController;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get all users with pagination
        this.router.get(
            '/',
            [
                query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
                query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
                query('search').optional().isString().withMessage('Search must be a string'),
                query('role').optional().isIn(['OWNER', 'ADMIN', 'STAFF']).withMessage('Invalid role'),
                query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validatePagination,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.userController.getUsers.bind(this.userController)
        );

        // Get user by ID
        this.router.get(
            '/:id',
            [
                param('id').isString().withMessage('User ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.userController.getUserById.bind(this.userController)
        );

        // Create new user
        this.router.post(
            '/',
            [
                body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
                body('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
                body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
                body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
                body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
                body('role').isIn(['OWNER', 'ADMIN', 'STAFF']).withMessage('Invalid role'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.userController.createUser.bind(this.userController)
        );

        // Update user
        this.router.put(
            '/:id',
            [
                param('id').isString().withMessage('User ID is required'),
                body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
                body('username').optional().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
                body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
                body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
                body('role').optional().isIn(['OWNER', 'ADMIN', 'STAFF']).withMessage('Invalid role'),
                body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.userController.updateUser.bind(this.userController)
        );

        // Delete user (soft delete)
        this.router.delete(
            '/:id',
            [
                param('id').isString().withMessage('User ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.userController.deleteUser.bind(this.userController)
        );

        // Search users
        this.router.get(
            '/search/:query',
            [
                param('query').isString().withMessage('Search query is required'),
                query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.userController.searchUsers.bind(this.userController)
        );

        // Get user statistics
        this.router.get(
            '/stats/overview',
            AuthMiddleware.authenticate,
            this.userController.getUserStats.bind(this.userController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
