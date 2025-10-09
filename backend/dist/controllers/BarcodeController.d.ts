import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class BarcodeController {
    private barcodeService;
    private logger;
    constructor();
    generateBarcode(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateBarcodeSVG(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateBarcodeDataURL(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateBarcodeLabel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getSupportedFormats(req: Request, res: Response, next: NextFunction): Promise<void>;
    scanBarcode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=BarcodeController.d.ts.map