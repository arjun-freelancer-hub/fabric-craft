"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const UserController_1 = require("@/controllers/UserController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class UserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userController = new UserController_1.UserController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', [
            (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
            (0, express_validator_1.query)('search').optional().isString().withMessage('Search must be a string'),
            (0, express_validator_1.query)('role').optional().isIn(['OWNER', 'ADMIN', 'STAFF']).withMessage('Invalid role'),
            (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validatePagination, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.getUsers.bind(this.userController));
        this.router.get('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('User ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.getUserById.bind(this.userController));
        this.router.post('/', [
            (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
            (0, express_validator_1.body)('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
            (0, express_validator_1.body)('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
            (0, express_validator_1.body)('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('role').isIn(['OWNER', 'ADMIN', 'STAFF']).withMessage('Invalid role'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.createUser.bind(this.userController));
        this.router.put('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('User ID is required'),
            (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
            (0, express_validator_1.body)('username').optional().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
            (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
            (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
            (0, express_validator_1.body)('role').optional().isIn(['OWNER', 'ADMIN', 'STAFF']).withMessage('Invalid role'),
            (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.updateUser.bind(this.userController));
        this.router.delete('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('User ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.deleteUser.bind(this.userController));
        this.router.get('/search/:query', [
            (0, express_validator_1.param)('query').isString().withMessage('Search query is required'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.searchUsers.bind(this.userController));
        this.router.get('/stats/overview', AuthMiddleware_1.AuthMiddleware.authenticate, this.userController.getUserStats.bind(this.userController));
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=UserRoutes.js.map