import { Request, Response, NextFunction } from 'express';
import { ProductModel } from '@/models/ProductModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';

export class ProductController {
    private productModel: ProductModel;
    private logger: Logger;

    constructor() {
        this.productModel = new ProductModel();
        this.logger = new Logger();
    }

    public async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, categoryId, type, isActive } = req.query;
            const pagination = (req as any).pagination;

            let where: any = {};

            // Apply filters
            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { description: { contains: search as string, mode: 'insensitive' } },
                    { sku: { contains: search as string, mode: 'insensitive' } },
                    { barcode: { contains: search as string, mode: 'insensitive' } },
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
        } catch (error) {
            next(error);
        }
    }

    public async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const product = await this.productModel.findById(id);
            if (!product) {
                throw ErrorHandler.createError('Product not found', 404);
            }

            res.status(200).json({
                success: true,
                data: { product },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getProductByBarcode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { barcode } = req.params;
            const organizationId = (req as any).organizationId; // Will be set by workspace middleware

            const product = await this.productModel.findByBarcode(organizationId, barcode);
            if (!product) {
                throw ErrorHandler.createError('Product not found', 404);
            }

            res.status(200).json({
                success: true,
                data: { product },
            });
        } catch (error) {
            next(error);
        }
    }

    public async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const productData = {
                ...req.body,
                createdBy: req.user!.id,
            };

            const product = await this.productModel.createProduct(productData);

            this.logger.info('Product created successfully', {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                createdBy: req.user!.id,
            });

            res.status(201).json({
                success: true,
                data: { product },
                message: 'Product created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const product = await this.productModel.updateProduct(id, updateData);

            this.logger.info('Product updated successfully', {
                productId: product.id,
                name: product.name,
                updatedBy: req.user!.id,
            });

            res.status(200).json({
                success: true,
                data: { product },
                message: 'Product updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const product = await this.productModel.softDelete(id);

            this.logger.info('Product deleted successfully', {
                productId: product.id,
                name: product.name,
                deletedBy: req.user!.id,
            });

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { categoryId } = req.params;

            const products = await this.productModel.getProductsByCategory(categoryId);

            res.status(200).json({
                success: true,
                data: { products },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getProductsByType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { type } = req.params;

            const products = await this.productModel.getProductsByType(type as any);

            res.status(200).json({
                success: true,
                data: { products },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getLowStockProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const products = await this.productModel.getLowStockProducts();

            res.status(200).json({
                success: true,
                data: { products },
            });
        } catch (error) {
            next(error);
        }
    }

    public async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { query } = req.params;
            const { categoryId, type, limit = 20 } = req.query;

            const products = await this.productModel.searchProducts(
                query,
                {
                    categoryId: categoryId as string,
                    type: type as any,
                },
                parseInt(limit as string)
            );

            res.status(200).json({
                success: true,
                data: { products },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getProductStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this.productModel.getProductStats();

            res.status(200).json({
                success: true,
                data: { stats },
            });
        } catch (error) {
            next(error);
        }
    }

    public async regenerateBarcode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const product = await this.productModel.regenerateBarcode(id);

            this.logger.info('Barcode regenerated successfully', {
                productId: product.id,
                newBarcode: product.barcode,
                regeneratedBy: req.user!.id,
            });

            res.status(200).json({
                success: true,
                data: { product },
                message: 'Barcode regenerated successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
