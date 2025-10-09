import { Request, Response, NextFunction } from 'express';
export declare class ReportController {
    private logger;
    constructor();
    getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCustomerReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductPerformanceReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ReportController.d.ts.map