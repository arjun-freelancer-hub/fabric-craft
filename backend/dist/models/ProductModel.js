"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const client_1 = require("@prisma/client");
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const BarcodeService_1 = require("@/services/BarcodeService");
class ProductModel extends BaseModel_1.BaseModel {
    constructor() {
        super();
        this.barcodeService = new BarcodeService_1.BarcodeService();
    }
    getTableName() {
        return 'product';
    }
    async createProduct(data) {
        try {
            const existingProduct = await this.findBySku(undefined, data.sku);
            if (existingProduct) {
                throw ErrorHandler_1.ErrorHandler.createError('Product with this SKU already exists', 409);
            }
            let barcode = data.sku;
            if (data.type !== client_1.ProductType.CUSTOM) {
                const barcodeResult = await this.barcodeService.generateBarcode(data.sku, 'CODE128');
                barcode = barcodeResult.text;
            }
            const productData = {
                ...data,
                barcode,
                minStock: data.minStock || 0,
                isTailoring: data.isTailoring || false,
            };
            const product = await this.create(productData);
            this.logOperation('CREATE', { id: product.id, name: product.name, sku: product.sku });
            return product;
        }
        catch (error) {
            this.logger.error('Error creating product:', error);
            throw error;
        }
    }
    async updateProduct(id, data) {
        try {
            const product = await this.update(id, data);
            this.logOperation('UPDATE', { id: product.id, name: product.name });
            return product;
        }
        catch (error) {
            this.logger.error('Error updating product:', error);
            throw error;
        }
    }
    async findBySku(organizationId, sku) {
        try {
            if (!organizationId) {
                const product = await this.prisma.product.findFirst({
                    where: { sku },
                });
                return product;
            }
            const product = await this.prisma.product.findUnique({
                where: {
                    organizationId_sku: {
                        organizationId,
                        sku,
                    },
                },
            });
            return product;
        }
        catch (error) {
            this.logger.error('Error finding product by SKU:', error);
            throw error;
        }
    }
    async findByBarcode(organizationId, barcode) {
        try {
            if (!organizationId) {
                const product = await this.prisma.product.findFirst({
                    where: { barcode },
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });
                return product;
            }
            const product = await this.prisma.product.findUnique({
                where: {
                    organizationId_barcode: {
                        organizationId,
                        barcode,
                    },
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return product;
        }
        catch (error) {
            this.logger.error('Error finding product by barcode:', error);
            throw error;
        }
    }
    async getProductsWithCategory(where = {}, options = {}) {
        try {
            const [data, total] = await Promise.all([
                this.prisma.product.findMany({
                    where,
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        inventory: {
                            select: {
                                quantity: true,
                                type: true,
                            },
                        },
                    },
                    ...options,
                }),
                this.prisma.product.count({ where }),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Error getting products with category:', error);
            throw error;
        }
    }
    async getProductsByCategory(categoryId) {
        try {
            const products = await this.prisma.product.findMany({
                where: {
                    categoryId,
                    isActive: true,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });
            return products;
        }
        catch (error) {
            this.logger.error('Error getting products by category:', error);
            throw error;
        }
    }
    async getProductsByType(type) {
        try {
            const products = await this.prisma.product.findMany({
                where: {
                    type,
                    isActive: true,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });
            return products;
        }
        catch (error) {
            this.logger.error('Error getting products by type:', error);
            throw error;
        }
    }
    async getLowStockProducts() {
        try {
            const products = await this.prisma.product.findMany({
                where: {
                    isActive: true,
                    minStock: {
                        gt: 0,
                    },
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    inventory: {
                        select: {
                            quantity: true,
                            type: true,
                        },
                    },
                },
            });
            const lowStockProducts = products.filter(product => {
                const totalStock = product.inventory
                    ?.filter(inv => inv.type === 'IN')
                    .reduce((sum, inv) => sum + inv.quantity, 0) || 0;
                return totalStock <= product.minStock;
            });
            return lowStockProducts;
        }
        catch (error) {
            this.logger.error('Error getting low stock products:', error);
            throw error;
        }
    }
    async searchProducts(query, filters = {}, limit = 20) {
        try {
            const where = {
                AND: [
                    {
                        OR: [
                            { name: { contains: query } },
                            { description: { contains: query } },
                            { sku: { contains: query } },
                            { barcode: { contains: query } },
                        ],
                    },
                ],
            };
            if (filters.categoryId) {
                where.AND.push({ categoryId: filters.categoryId });
            }
            if (filters.type) {
                where.AND.push({ type: filters.type });
            }
            if (filters.isActive !== undefined) {
                where.AND.push({ isActive: filters.isActive });
            }
            const products = await this.prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                take: limit,
                orderBy: { name: 'asc' },
            });
            return products;
        }
        catch (error) {
            this.logger.error('Error searching products:', error);
            throw error;
        }
    }
    async getProductStats() {
        try {
            const [total, active, byType, byCategory] = await Promise.all([
                this.count(),
                this.count({ isActive: true }),
                this.prisma.product.groupBy({
                    by: ['type'],
                    _count: { type: true },
                }),
                this.prisma.product.groupBy({
                    by: ['categoryId'],
                    _count: { categoryId: true },
                }),
            ]);
            const typeStats = byType.reduce((acc, item) => {
                acc[item.type] = item._count.type;
                return acc;
            }, {});
            const categoryStats = await Promise.all(byCategory.map(async (item) => {
                const category = await this.prisma.category.findUnique({
                    where: { id: item.categoryId },
                    select: { name: true },
                });
                return {
                    categoryName: category?.name || 'Unknown',
                    count: item._count.categoryId,
                };
            }));
            return {
                total,
                active,
                byType: typeStats,
                byCategory: categoryStats,
            };
        }
        catch (error) {
            this.logger.error('Error getting product stats:', error);
            throw error;
        }
    }
    async regenerateBarcode(id) {
        try {
            const product = await this.findById(id);
            if (!product) {
                throw ErrorHandler_1.ErrorHandler.createError('Product not found', 404);
            }
            const newBarcode = await this.barcodeService.generateBarcode(product.sku, 'CODE128');
            const updatedProduct = await this.update(id, { barcode: newBarcode });
            this.logOperation('REGENERATE_BARCODE', { id: product.id, newBarcode });
            return updatedProduct;
        }
        catch (error) {
            this.logger.error('Error regenerating barcode:', error);
            throw error;
        }
    }
}
exports.ProductModel = ProductModel;
//# sourceMappingURL=ProductModel.js.map