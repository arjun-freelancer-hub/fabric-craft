"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const CategoryController_1 = require("@/controllers/CategoryController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class CategoryRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.categoryController = new CategoryController_1.CategoryController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.categoryController.getCategories.bind(this.categoryController));
        this.router.get('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Category ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.categoryController.getCategoryById.bind(this.categoryController));
        this.router.post('/', [
            (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name is required and must be less than 100 characters'),
            (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.categoryController.createCategory.bind(this.categoryController));
        this.router.put('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Category ID is required'),
            (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Category name must be less than 100 characters'),
            (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string'),
            (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.categoryController.updateCategory.bind(this.categoryController));
        this.router.delete('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Category ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.categoryController.deleteCategory.bind(this.categoryController));
    }
    getRouter() {
        return this.router;
    }
}
exports.CategoryRoutes = CategoryRoutes;
//# sourceMappingURL=CategoryRoutes.js.map