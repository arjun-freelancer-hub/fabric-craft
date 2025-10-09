import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class InventoryController {
    private inventoryModel;
    private logger;
    constructor();
    getInventory(req: Request, res: Response, next: NextFunction): Promise<void>;
    addInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getProductStock(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=InventoryController.d.ts.map