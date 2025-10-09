import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class ProductController {
    private productModel;
    private logger;
    constructor();
    getProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductByBarcode(req: Request, res: Response, next: NextFunction): Promise<void>;
    createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductsByType(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLowStockProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    regenerateBarcode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ProductController.d.ts.map