import { Request, Response, NextFunction } from 'express';

/**
 * Utility function to catch async errors and pass them to Express error handler
 * This eliminates the need for repetitive try-catch blocks in controllers
 * 
 * @param fn - Async function that handles the request
 * @returns Express middleware function
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Alternative version that works with class methods
 * Usage: catchAsyncMethod(this.methodName.bind(this))
 */
export const catchAsyncMethod = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
