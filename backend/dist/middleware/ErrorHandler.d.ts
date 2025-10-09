import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class ErrorHandler {
    private static logError;
    static handle(error: AppError, req: Request, res: Response, next: NextFunction): void;
    private static handlePrismaError;
    static createError(message: string, statusCode?: number, isOperational?: boolean): AppError;
    static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map