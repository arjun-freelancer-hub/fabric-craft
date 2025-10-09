"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const AuthController_1 = require("@/controllers/AuthController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authController = new AuthController_1.AuthController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/login', [
            (0, express_validator_1.body)('email')
                .isEmail()
                .normalizeEmail()
                .withMessage('Please provide a valid email'),
            (0, express_validator_1.body)('password')
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters long'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.authController.login.bind(this.authController));
        this.router.post('/register', [
            (0, express_validator_1.body)('email')
                .isEmail()
                .normalizeEmail()
                .withMessage('Please provide a valid email'),
            (0, express_validator_1.body)('username')
                .isLength({ min: 3, max: 20 })
                .matches(/^[a-zA-Z0-9_]+$/)
                .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
            (0, express_validator_1.body)('password')
                .isLength({ min: 8 })
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
            (0, express_validator_1.body)('firstName')
                .trim()
                .isLength({ min: 1, max: 50 })
                .withMessage('First name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('lastName')
                .trim()
                .isLength({ min: 1, max: 50 })
                .withMessage('Last name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('organizationName')
                .optional()
                .trim()
                .isLength({ min: 1, max: 100 })
                .withMessage('Organization name must be less than 100 characters'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.authController.register.bind(this.authController));
        this.router.post('/accept-invitation', [
            (0, express_validator_1.body)('token')
                .notEmpty()
                .withMessage('Invitation token is required'),
            (0, express_validator_1.body)('username')
                .optional()
                .isLength({ min: 3, max: 20 })
                .matches(/^[a-zA-Z0-9_]+$/)
                .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
            (0, express_validator_1.body)('password')
                .optional()
                .isLength({ min: 8 })
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
            (0, express_validator_1.body)('firstName')
                .optional()
                .trim()
                .isLength({ min: 1, max: 50 })
                .withMessage('First name is required and must be less than 50 characters'),
            (0, express_validator_1.body)('lastName')
                .optional()
                .trim()
                .isLength({ min: 1, max: 50 })
                .withMessage('Last name is required and must be less than 50 characters'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.authController.acceptInvitation.bind(this.authController));
        this.router.get('/invite/verify/:token', this.authController.verifyInvitation.bind(this.authController));
        this.router.post('/refresh', [
            (0, express_validator_1.body)('refreshToken')
                .notEmpty()
                .withMessage('Refresh token is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.authController.refreshToken.bind(this.authController));
        this.router.post('/logout', AuthMiddleware_1.AuthMiddleware.authenticate, this.authController.logout.bind(this.authController));
        this.router.post('/change-password', [
            (0, express_validator_1.body)('currentPassword')
                .notEmpty()
                .withMessage('Current password is required'),
            (0, express_validator_1.body)('newPassword')
                .isLength({ min: 8 })
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.authController.changePassword.bind(this.authController));
        this.router.get('/profile', AuthMiddleware_1.AuthMiddleware.authenticate, this.authController.getProfile.bind(this.authController));
        this.router.put('/profile', [
            (0, express_validator_1.body)('firstName')
                .optional()
                .trim()
                .isLength({ min: 1, max: 50 })
                .withMessage('First name must be less than 50 characters'),
            (0, express_validator_1.body)('lastName')
                .optional()
                .trim()
                .isLength({ min: 1, max: 50 })
                .withMessage('Last name must be less than 50 characters'),
            (0, express_validator_1.body)('email')
                .optional()
                .isEmail()
                .normalizeEmail()
                .withMessage('Please provide a valid email'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.authController.updateProfile.bind(this.authController));
        this.router.get('/verify', AuthMiddleware_1.AuthMiddleware.authenticate, this.authController.verifyToken.bind(this.authController));
        this.router.post('/forgot-password', [
            (0, express_validator_1.body)('email')
                .isEmail()
                .normalizeEmail()
                .withMessage('Please provide a valid email'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.authController.forgotPassword.bind(this.authController));
        this.router.post('/reset-password', [
            (0, express_validator_1.body)('token')
                .notEmpty()
                .withMessage('Reset token is required'),
            (0, express_validator_1.body)('newPassword')
                .isLength({ min: 8 })
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
                .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.authController.resetPassword.bind(this.authController));
        this.router.get('/reset-password/verify/:token', this.authController.verifyResetToken.bind(this.authController));
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRoutes = AuthRoutes;
//# sourceMappingURL=AuthRoutes.js.map