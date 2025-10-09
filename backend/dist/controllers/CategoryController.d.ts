import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class CategoryController {
    private categoryModel;
    private logger;
    constructor();
    getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=CategoryController.d.ts.map