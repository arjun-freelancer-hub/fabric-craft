import { Product, ProductType, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { BarcodeService } from '@/services/BarcodeService';

export interface CreateProductData {
    name: string;
    description?: string;
    sku: string;
    categoryId: string;
    type: ProductType;
    unit: string;
    basePrice: number;
    sellingPrice: number;
    costPrice: number;
    minStock?: number;
    maxStock?: number;
    isTailoring?: boolean;
    tailoringPrice?: number;
    imageUrl?: string;
    specifications?: any;
    createdBy: string;
}

export interface UpdateProductData {
    name?: string;
    description?: string;
    categoryId?: string;
    type?: ProductType;
    unit?: string;
    basePrice?: number;
    sellingPrice?: number;
    costPrice?: number;
    minStock?: number;
    maxStock?: number;
    isTailoring?: boolean;
    tailoringPrice?: number;
    imageUrl?: string;
    specifications?: any;
    isActive?: boolean;
}

export interface ProductWithCategory extends Product {
    category: {
        id: string;
        name: string;
    };
    inventory?: {
        quantity: number;
    }[];
}

export class ProductModel extends BaseModel<Product> {
    private barcodeService: BarcodeService;

    constructor() {
        super();
        this.barcodeService = new BarcodeService();
    }

    getTableName(): string {
        return 'product';
    }

    public async createProduct(data: CreateProductData): Promise<Product> {
        try {
            // Check if SKU already exists (will be workspace-scoped when organizationId is added)
            const existingProduct = await this.findBySku(undefined, data.sku);
            if (existingProduct) {
                throw ErrorHandler.createError('Product with this SKU already exists', 409);
            }

            // Generate barcode if not provided
            let barcode = data.sku; // Use SKU as default barcode
            if (data.type !== ProductType.CUSTOM) {
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
        } catch (error) {
            this.logger.error('Error creating product:', error);
            throw error;
        }
    }

    public async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
        try {
            const product = await this.update(id, data);
            this.logOperation('UPDATE', { id: product.id, name: product.name });
            return product;
        } catch (error) {
            this.logger.error('Error updating product:', error);
            throw error;
        }
    }

    public async findBySku(organizationId: string | undefined, sku: string): Promise<Product | null> {
        try {
            if (!organizationId) {
                // Fallback for backward compatibility
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
        } catch (error) {
            this.logger.error('Error finding product by SKU:', error);
            throw error;
        }
    }

    public async findByBarcode(organizationId: string | undefined, barcode: string): Promise<Product | null> {
        try {
            if (!organizationId) {
                // Fallback for backward compatibility
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
        } catch (error) {
            this.logger.error('Error finding product by barcode:', error);
            throw error;
        }
    }

    public async getProductsWithCategory(
        where: any = {},
        options: {
            skip?: number;
            take?: number;
            orderBy?: any;
        } = {}
    ): Promise<{ data: ProductWithCategory[]; total: number }> {
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
        } catch (error) {
            this.logger.error('Error getting products with category:', error);
            throw error;
        }
    }

    public async getProductsByCategory(categoryId: string): Promise<Product[]> {
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
        } catch (error) {
            this.logger.error('Error getting products by category:', error);
            throw error;
        }
    }

    public async getProductsByType(type: ProductType): Promise<Product[]> {
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
        } catch (error) {
            this.logger.error('Error getting products by type:', error);
            throw error;
        }
    }

    public async getLowStockProducts(): Promise<Product[]> {
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

            // Filter products with low stock
            const lowStockProducts = products.filter(product => {
                const totalStock = product.inventory
                    ?.filter(inv => inv.type === 'IN')
                    .reduce((sum, inv) => sum + inv.quantity, 0) || 0;

                return totalStock <= product.minStock;
            });

            return lowStockProducts;
        } catch (error) {
            this.logger.error('Error getting low stock products:', error);
            throw error;
        }
    }

    public async searchProducts(
        query: string,
        filters: {
            categoryId?: string;
            type?: ProductType;
            isActive?: boolean;
        } = {},
        limit: number = 20
    ): Promise<Product[]> {
        try {
            const where: Prisma.ProductWhereInput = {
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
                (where.AND as any[]).push({ categoryId: filters.categoryId });
            }

            if (filters.type) {
                (where.AND as any[]).push({ type: filters.type });
            }

            if (filters.isActive !== undefined) {
                (where.AND as any[]).push({ isActive: filters.isActive });
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
        } catch (error) {
            this.logger.error('Error searching products:', error);
            throw error;
        }
    }

    public async getProductStats(): Promise<{
        total: number;
        active: number;
        byType: Record<ProductType, number>;
        byCategory: Array<{ categoryName: string; count: number }>;
    }> {
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
            }, {} as Record<ProductType, number>);

            const categoryStats = await Promise.all(
                byCategory.map(async (item) => {
                    const category = await this.prisma.category.findUnique({
                        where: { id: item.categoryId },
                        select: { name: true },
                    });
                    return {
                        categoryName: category?.name || 'Unknown',
                        count: item._count.categoryId,
                    };
                })
            );

            return {
                total,
                active,
                byType: typeStats,
                byCategory: categoryStats,
            };
        } catch (error) {
            this.logger.error('Error getting product stats:', error);
            throw error;
        }
    }

    public async regenerateBarcode(id: string): Promise<Product> {
        try {
            const product = await this.findById(id);
            if (!product) {
                throw ErrorHandler.createError('Product not found', 404);
            }

            const newBarcode = await this.barcodeService.generateBarcode(product.sku, 'CODE128');

            const updatedProduct = await this.update(id, { barcode: newBarcode });
            this.logOperation('REGENERATE_BARCODE', { id: product.id, newBarcode });
            return updatedProduct;
        } catch (error) {
            this.logger.error('Error regenerating barcode:', error);
            throw error;
        }
    }
}
