import { Request, Response, NextFunction } from 'express';
export declare class ValidationMiddleware {
    static validate(req: Request, res: Response, next: NextFunction): void;
    static sanitizeInput(req: Request, res: Response, next: NextFunction): void;
    static validatePagination(req: Request, res: Response, next: NextFunction): void;
    static validateFileUpload(allowedTypes?: string[], maxSize?: number): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=ValidationMiddleware.d.ts.map