import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class BillController {
    private billModel;
    private logger;
    private whatsappService;
    constructor();
    getBills(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBillById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    cancelBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void>;
    sendInvoiceWhatsApp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBillPayments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBillStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDailySalesReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=BillController.d.ts.map