import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class SettingController {
    private settingModel;
    private businessSettingModel;
    private invoicePDFService;
    private logger;
    constructor();
    getWhatsAppSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateWhatsAppSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    testWhatsAppConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSettingsByCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBusinessSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateBusinessSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    generateSampleInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=SettingController.d.ts.map