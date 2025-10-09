"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const ProductModel_1 = require("@/models/ProductModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
class ProductController {
    constructor() {
        this.productModel = new ProductModel_1.ProductModel();
        this.logger = new Logger_1.Logger();
    }
    async getProducts(req, res, next) {
        try {
            const { search, categoryId, type, isActive } = req.query;
            const pagination = req.pagination;
            let where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                    { barcode: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (categoryId) {
                where.categoryId = categoryId;
            }
            if (type) {
                where.type = type;
            }
            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }
            const { data, total } = await this.productModel.getProductsWithCategory(where, {
                skip: pagination.offset,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
            });
            res.status(200).json({
                success: true,
                data: {
                    products: data,
                    pagination: {
                        page: pagination.page,
                        limit: pagination.limit,
                        total,
                        pages: Math.ceil(total / pagination.limit),
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await this.productModel.findById(id);
            if (!product) {
                throw ErrorHandler_1.ErrorHandler.createError('Product not found', 404);
            }
            res.status(200).json({
                success: true,
                data: { product },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductByBarcode(req, res, next) {
        try {
            const { barcode } = req.params;
            const organizationId = req.organizationId;
            const product = await this.productModel.findByBarcode(organizationId, barcode);
            if (!product) {
                throw ErrorHandler_1.ErrorHandler.createError('Product not found', 404);
            }
            res.status(200).json({
                success: true,
                data: { product },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createProduct(req, res, next) {
        try {
            const productData = {
                ...req.body,
                createdBy: req.user.id,
            };
            const product = await this.productModel.createProduct(productData);
            this.logger.info('Product created successfully', {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                createdBy: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { product },
                message: 'Product created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const product = await this.productModel.updateProduct(id, updateData);
            this.logger.info('Product updated successfully', {
                productId: product.id,
                name: product.name,
                updatedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { product },
                message: 'Product updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const product = await this.productModel.softDelete(id);
            this.logger.info('Product deleted successfully', {
                productId: product.id,
                name: product.name,
                deletedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductsByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const products = await this.productModel.getProductsByCategory(categoryId);
            res.status(200).json({
                success: true,
                data: { products },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductsByType(req, res, next) {
        try {
            const { type } = req.params;
            const products = await this.productModel.getProductsByType(type);
            res.status(200).json({
                success: true,
                data: { products },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getLowStockProducts(req, res, next) {
        try {
            const products = await this.productModel.getLowStockProducts();
            res.status(200).json({
                success: true,
                data: { products },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async searchProducts(req, res, next) {
        try {
            const { query } = req.params;
            const { categoryId, type, limit = 20 } = req.query;
            const products = await this.productModel.searchProducts(query, {
                categoryId: categoryId,
                type: type,
            }, parseInt(limit));
            res.status(200).json({
                success: true,
                data: { products },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductStats(req, res, next) {
        try {
            const stats = await this.productModel.getProductStats();
            res.status(200).json({
                success: true,
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async regenerateBarcode(req, res, next) {
        try {
            const { id } = req.params;
            const product = await this.productModel.regenerateBarcode(id);
            this.logger.info('Barcode regenerated successfully', {
                productId: product.id,
                newBarcode: product.barcode,
                regeneratedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { product },
                message: 'Barcode regenerated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=ProductController.js.map