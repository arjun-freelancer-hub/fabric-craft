"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const ProductController_1 = require("@/controllers/ProductController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class ProductRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.productController = new ProductController_1.ProductController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', [
            (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
            (0, express_validator_1.query)('search').optional().isString().withMessage('Search must be a string'),
            (0, express_validator_1.query)('categoryId').optional().isString().withMessage('Category ID must be a string'),
            (0, express_validator_1.query)('type').optional().isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
            (0, express_validator_1.query)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validatePagination, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.productController.getProducts.bind(this.productController));
        this.router.get('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Product ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.productController.getProductById.bind(this.productController));
        this.router.get('/barcode/:barcode', [
            (0, express_validator_1.param)('barcode').isString().withMessage('Barcode is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.productController.getProductByBarcode.bind(this.productController));
        this.router.post('/', [
            (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 255 }).withMessage('Product name is required and must be less than 255 characters'),
            (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string'),
            (0, express_validator_1.body)('sku').trim().isLength({ min: 1, max: 100 }).withMessage('SKU is required and must be less than 100 characters'),
            (0, express_validator_1.body)('categoryId').isString().withMessage('Category ID is required'),
            (0, express_validator_1.body)('type').isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
            (0, express_validator_1.body)('unit').trim().isLength({ min: 1, max: 20 }).withMessage('Unit is required and must be less than 20 characters'),
            (0, express_validator_1.body)('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
            (0, express_validator_1.body)('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
            (0, express_validator_1.body)('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
            (0, express_validator_1.body)('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
            (0, express_validator_1.body)('maxStock').optional().isInt({ min: 0 }).withMessage('Max stock must be a non-negative integer'),
            (0, express_validator_1.body)('isTailoring').optional().isBoolean().withMessage('isTailoring must be a boolean'),
            (0, express_validator_1.body)('tailoringPrice').optional().isFloat({ min: 0 }).withMessage('Tailoring price must be a positive number'),
            (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
            (0, express_validator_1.body)('specifications').optional().isObject().withMessage('Specifications must be an object'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.productController.createProduct.bind(this.productController));
        this.router.put('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Product ID is required'),
            (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Product name must be less than 255 characters'),
            (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string'),
            (0, express_validator_1.body)('categoryId').optional().isString().withMessage('Category ID must be a string'),
            (0, express_validator_1.body)('type').optional().isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
            (0, express_validator_1.body)('unit').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Unit must be less than 20 characters'),
            (0, express_validator_1.body)('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
            (0, express_validator_1.body)('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
            (0, express_validator_1.body)('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
            (0, express_validator_1.body)('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
            (0, express_validator_1.body)('maxStock').optional().isInt({ min: 0 }).withMessage('Max stock must be a non-negative integer'),
            (0, express_validator_1.body)('isTailoring').optional().isBoolean().withMessage('isTailoring must be a boolean'),
            (0, express_validator_1.body)('tailoringPrice').optional().isFloat({ min: 0 }).withMessage('Tailoring price must be a positive number'),
            (0, express_validator_1.body)('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
            (0, express_validator_1.body)('specifications').optional().isObject().withMessage('Specifications must be an object'),
            (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.productController.updateProduct.bind(this.productController));
        this.router.delete('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Product ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.productController.deleteProduct.bind(this.productController));
        this.router.get('/category/:categoryId', [
            (0, express_validator_1.param)('categoryId').isString().withMessage('Category ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.productController.getProductsByCategory.bind(this.productController));
        this.router.get('/type/:type', [
            (0, express_validator_1.param)('type').isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.productController.getProductsByType.bind(this.productController));
        this.router.get('/low-stock', AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER', 'STAFF'), this.productController.getLowStockProducts.bind(this.productController));
        this.router.get('/search/:query', [
            (0, express_validator_1.param)('query').isString().withMessage('Search query is required'),
            (0, express_validator_1.query)('categoryId').optional().isString().withMessage('Category ID must be a string'),
            (0, express_validator_1.query)('type').optional().isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.productController.searchProducts.bind(this.productController));
        this.router.get('/stats/overview', AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.productController.getProductStats.bind(this.productController));
        this.router.post('/:id/regenerate-barcode', [
            (0, express_validator_1.param)('id').isString().withMessage('Product ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.productController.regenerateBarcode.bind(this.productController));
    }
    getRouter() {
        return this.router;
    }
}
exports.ProductRoutes = ProductRoutes;
//# sourceMappingURL=ProductRoutes.js.map