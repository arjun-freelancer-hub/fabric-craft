import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { ProductController } from '@/controllers/ProductController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class ProductRoutes {
    private router: Router;
    private productController: ProductController;

    constructor() {
        this.router = Router();
        this.productController = new ProductController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get all products with pagination and filters
        this.router.get(
            '/',
            [
                query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
                query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
                query('search').optional().isString().withMessage('Search must be a string'),
                query('categoryId').optional().isString().withMessage('Category ID must be a string'),
                query('type').optional().isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
                query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validatePagination,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.productController.getProducts.bind(this.productController)
        );

        // Get product by ID
        this.router.get(
            '/:id',
            [
                param('id').isString().withMessage('Product ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.productController.getProductById.bind(this.productController)
        );

        // Get product by barcode
        this.router.get(
            '/barcode/:barcode',
            [
                param('barcode').isString().withMessage('Barcode is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.productController.getProductByBarcode.bind(this.productController)
        );

        // Create new product
        this.router.post(
            '/',
            [
                body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Product name is required and must be less than 255 characters'),
                body('description').optional().isString().withMessage('Description must be a string'),
                body('sku').trim().isLength({ min: 1, max: 100 }).withMessage('SKU is required and must be less than 100 characters'),
                body('categoryId').isString().withMessage('Category ID is required'),
                body('type').isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
                body('unit').trim().isLength({ min: 1, max: 20 }).withMessage('Unit is required and must be less than 20 characters'),
                body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
                body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
                body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
                body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
                body('maxStock').optional().isInt({ min: 0 }).withMessage('Max stock must be a non-negative integer'),
                body('isTailoring').optional().isBoolean().withMessage('isTailoring must be a boolean'),
                body('tailoringPrice').optional().isFloat({ min: 0 }).withMessage('Tailoring price must be a positive number'),
                body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
                body('specifications').optional().isObject().withMessage('Specifications must be an object'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.productController.createProduct.bind(this.productController)
        );

        // Update product
        this.router.put(
            '/:id',
            [
                param('id').isString().withMessage('Product ID is required'),
                body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Product name must be less than 255 characters'),
                body('description').optional().isString().withMessage('Description must be a string'),
                body('categoryId').optional().isString().withMessage('Category ID must be a string'),
                body('type').optional().isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
                body('unit').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Unit must be less than 20 characters'),
                body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
                body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
                body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
                body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
                body('maxStock').optional().isInt({ min: 0 }).withMessage('Max stock must be a non-negative integer'),
                body('isTailoring').optional().isBoolean().withMessage('isTailoring must be a boolean'),
                body('tailoringPrice').optional().isFloat({ min: 0 }).withMessage('Tailoring price must be a positive number'),
                body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
                body('specifications').optional().isObject().withMessage('Specifications must be an object'),
                body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.productController.updateProduct.bind(this.productController)
        );

        // Delete product (soft delete)
        this.router.delete(
            '/:id',
            [
                param('id').isString().withMessage('Product ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.productController.deleteProduct.bind(this.productController)
        );

        // Get products by category
        this.router.get(
            '/category/:categoryId',
            [
                param('categoryId').isString().withMessage('Category ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.productController.getProductsByCategory.bind(this.productController)
        );

        // Get products by type
        this.router.get(
            '/type/:type',
            [
                param('type').isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.productController.getProductsByType.bind(this.productController)
        );

        // Get low stock products
        this.router.get(
            '/low-stock',
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER', 'STAFF'),
            this.productController.getLowStockProducts.bind(this.productController)
        );

        // Search products
        this.router.get(
            '/search/:query',
            [
                param('query').isString().withMessage('Search query is required'),
                query('categoryId').optional().isString().withMessage('Category ID must be a string'),
                query('type').optional().isIn(['FABRIC', 'READY_MADE', 'ACCESSORY', 'TAILORING_SERVICE', 'CUSTOM']).withMessage('Invalid product type'),
                query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.productController.searchProducts.bind(this.productController)
        );

        // Get product statistics
        this.router.get(
            '/stats/overview',
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.productController.getProductStats.bind(this.productController)
        );

        // Regenerate barcode
        this.router.post(
            '/:id/regenerate-barcode',
            [
                param('id').isString().withMessage('Product ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.productController.regenerateBarcode.bind(this.productController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
