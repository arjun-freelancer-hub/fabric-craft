import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { CustomerController } from '@/controllers/CustomerController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class CustomerRoutes {
    private router: Router;
    private customerController: CustomerController;

    constructor() {
        this.router = Router();
        this.customerController = new CustomerController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get all customers with pagination
        this.router.get(
            '/',
            [
                query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
                query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
                query('search').optional().isString().withMessage('Search must be a string'),
                query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validatePagination,
            ValidationMiddleware.sanitizeInput,
            this.customerController.getCustomers.bind(this.customerController)
        );

        // Get customer by ID
        this.router.get(
            '/:id',
            [
                param('id').isString().withMessage('Customer ID is required'),
            ],
            ValidationMiddleware.validate,
            this.customerController.getCustomerById.bind(this.customerController)
        );

        // Create new customer
        this.router.post(
            '/',
            [
                body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
                body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
                body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
                body('phone').optional().isString().withMessage('Phone must be a string'),
                body('address').optional().isString().withMessage('Address must be a string'),
                body('city').optional().isString().withMessage('City must be a string'),
                body('state').optional().isString().withMessage('State must be a string'),
                body('pincode').optional().isString().withMessage('Pincode must be a string'),
                body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
                body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.customerController.createCustomer.bind(this.customerController)
        );

        // Update customer
        this.router.put(
            '/:id',
            [
                param('id').isString().withMessage('Customer ID is required'),
                body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
                body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
                body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
                body('phone').optional().isString().withMessage('Phone must be a string'),
                body('address').optional().isString().withMessage('Address must be a string'),
                body('city').optional().isString().withMessage('City must be a string'),
                body('state').optional().isString().withMessage('State must be a string'),
                body('pincode').optional().isString().withMessage('Pincode must be a string'),
                body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
                body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
                body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.customerController.updateCustomer.bind(this.customerController)
        );

        // Delete customer (soft delete)
        this.router.delete(
            '/:id',
            [
                param('id').isString().withMessage('Customer ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.customerController.deleteCustomer.bind(this.customerController)
        );

        // Search customers
        this.router.get(
            '/search/:query',
            [
                param('query').isString().withMessage('Search query is required'),
                query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
            ],
            ValidationMiddleware.validate,
            this.customerController.searchCustomers.bind(this.customerController)
        );

        // Get customer measurements
        this.router.get(
            '/:id/measurements',
            [
                param('id').isString().withMessage('Customer ID is required'),
            ],
            ValidationMiddleware.validate,
            this.customerController.getCustomerMeasurements.bind(this.customerController)
        );

        // Add customer measurement
        this.router.post(
            '/:id/measurements',
            [
                param('id').isString().withMessage('Customer ID is required'),
                body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Measurement name is required and must be less than 100 characters'),
                body('measurements').isObject().withMessage('Measurements must be an object'),
                body('notes').optional().isString().withMessage('Notes must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.customerController.addCustomerMeasurement.bind(this.customerController)
        );

        // Update customer measurement
        this.router.put(
            '/:id/measurements/:measurementId',
            [
                param('id').isString().withMessage('Customer ID is required'),
                param('measurementId').isString().withMessage('Measurement ID is required'),
                body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Measurement name must be less than 100 characters'),
                body('measurements').optional().isObject().withMessage('Measurements must be an object'),
                body('notes').optional().isString().withMessage('Notes must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.customerController.updateCustomerMeasurement.bind(this.customerController)
        );

        // Delete customer measurement
        this.router.delete(
            '/:id/measurements/:measurementId',
            [
                param('id').isString().withMessage('Customer ID is required'),
                param('measurementId').isString().withMessage('Measurement ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.customerController.deleteCustomerMeasurement.bind(this.customerController)
        );

        // Get customer bills
        this.router.get(
            '/:id/bills',
            [
                param('id').isString().withMessage('Customer ID is required'),
                query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
                query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
            ],
            ValidationMiddleware.validatePagination,
            this.customerController.getCustomerBills.bind(this.customerController)
        );

        // Get customer statistics
        this.router.get(
            '/stats/overview',
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.customerController.getCustomerStats.bind(this.customerController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
