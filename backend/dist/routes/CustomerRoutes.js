"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const CustomerController_1 = require("@/controllers/CustomerController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class CustomerRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.customerController = new CustomerController_1.CustomerController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', [
            (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
            (0, express_validator_1.query)('search').optional().isString().withMessage('Search must be a string'),
            (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validatePagination, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.customerController.getCustomers.bind(this.customerController));
        this.router.get('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.customerController.getCustomerById.bind(this.customerController));
        this.router.post('/', [
            (0, express_validator_1.body)('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
            (0, express_validator_1.body)('phone').optional().isString().withMessage('Phone must be a string'),
            (0, express_validator_1.body)('address').optional().isString().withMessage('Address must be a string'),
            (0, express_validator_1.body)('city').optional().isString().withMessage('City must be a string'),
            (0, express_validator_1.body)('state').optional().isString().withMessage('State must be a string'),
            (0, express_validator_1.body)('pincode').optional().isString().withMessage('Pincode must be a string'),
            (0, express_validator_1.body)('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
            (0, express_validator_1.body)('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.customerController.createCustomer.bind(this.customerController));
        this.router.put('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
            (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
            (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
            (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
            (0, express_validator_1.body)('phone').optional().isString().withMessage('Phone must be a string'),
            (0, express_validator_1.body)('address').optional().isString().withMessage('Address must be a string'),
            (0, express_validator_1.body)('city').optional().isString().withMessage('City must be a string'),
            (0, express_validator_1.body)('state').optional().isString().withMessage('State must be a string'),
            (0, express_validator_1.body)('pincode').optional().isString().withMessage('Pincode must be a string'),
            (0, express_validator_1.body)('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
            (0, express_validator_1.body)('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
            (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.customerController.updateCustomer.bind(this.customerController));
        this.router.delete('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.customerController.deleteCustomer.bind(this.customerController));
        this.router.get('/search/:query', [
            (0, express_validator_1.param)('query').isString().withMessage('Search query is required'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.customerController.searchCustomers.bind(this.customerController));
        this.router.get('/:id/measurements', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.customerController.getCustomerMeasurements.bind(this.customerController));
        this.router.post('/:id/measurements', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
            (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }).withMessage('Measurement name is required and must be less than 100 characters'),
            (0, express_validator_1.body)('measurements').isObject().withMessage('Measurements must be an object'),
            (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.customerController.addCustomerMeasurement.bind(this.customerController));
        this.router.put('/:id/measurements/:measurementId', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
            (0, express_validator_1.param)('measurementId').isString().withMessage('Measurement ID is required'),
            (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Measurement name must be less than 100 characters'),
            (0, express_validator_1.body)('measurements').optional().isObject().withMessage('Measurements must be an object'),
            (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.customerController.updateCustomerMeasurement.bind(this.customerController));
        this.router.delete('/:id/measurements/:measurementId', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
            (0, express_validator_1.param)('measurementId').isString().withMessage('Measurement ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.customerController.deleteCustomerMeasurement.bind(this.customerController));
        this.router.get('/:id/bills', [
            (0, express_validator_1.param)('id').isString().withMessage('Customer ID is required'),
            (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        ], ValidationMiddleware_1.ValidationMiddleware.validatePagination, this.customerController.getCustomerBills.bind(this.customerController));
        this.router.get('/stats/overview', AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.customerController.getCustomerStats.bind(this.customerController));
    }
    getRouter() {
        return this.router;
    }
}
exports.CustomerRoutes = CustomerRoutes;
//# sourceMappingURL=CustomerRoutes.js.map