import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class ErrorHandler {
    private static logError(error: AppError, req: Request): void {
        // Use console for error logging to avoid any Logger class issues
        console.error('=== ERROR HANDLER ===');
        console.error('Message:', error.message);
        console.error('Status Code:', error.statusCode || 500);
        console.error('Stack:', error.stack);
        console.error('URL:', req?.url || 'unknown');
        console.error('Method:', req?.method || 'unknown');
        console.error('IP:', req?.ip || 'unknown');
        console.error('User Agent:', req?.get?.('User-Agent') || 'unknown');
        console.error('===================');
    }

    public static handle(
        error: AppError,
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        let statusCode = error.statusCode || 500;
        let message = error.message || 'Internal Server Error';
        let isOperational = error.isOperational || false;

        // Log error first
        ErrorHandler.logError(error, req);

        // Handle specific error types
        if (error instanceof PrismaClientKnownRequestError) {
            const prismaError = ErrorHandler.handlePrismaError(error);
            statusCode = prismaError.statusCode;
            message = prismaError.message;
            isOperational = true;
        } else if (error instanceof PrismaClientValidationError) {
            statusCode = 400;
            message = 'Invalid data provided';
            isOperational = true;
        } else if (error.name === 'ValidationError') {
            statusCode = 400;
            message = 'Validation failed';
            isOperational = true;
        } else if (error.name === 'UnauthorizedError') {
            statusCode = 401;
            message = 'Unauthorized access';
            isOperational = true;
        } else if (error.name === 'ForbiddenError') {
            statusCode = 403;
            message = 'Access forbidden';
            isOperational = true;
        } else if (error.name === 'NotFoundError') {
            statusCode = 404;
            message = 'Resource not found';
            isOperational = true;
        } else if (error.name === 'ConflictError') {
            statusCode = 409;
            message = 'Resource conflict';
            isOperational = true;
        }

        // Send error response
        const errorResponse: any = {
            success: false,
            error: {
                message,
                ...(process.env.NODE_ENV === 'development' && {
                    stack: error.stack,
                    details: error,
                }),
            },
        };

        // Add request ID if available
        if (req.headers['x-request-id']) {
            errorResponse.requestId = req.headers['x-request-id'];
        }

        res.status(statusCode).json(errorResponse);
    }

    private static handlePrismaError(error: PrismaClientKnownRequestError): {
        statusCode: number;
        message: string;
    } {
        switch (error.code) {
            case 'P2000':
                return {
                    statusCode: 400,
                    message: 'The provided value is too long for the database field',
                };
            case 'P2002':
                return {
                    statusCode: 409,
                    message: 'A record with this information already exists',
                };
            case 'P2025':
                return {
                    statusCode: 404,
                    message: 'Record not found',
                };
            case 'P2003':
                return {
                    statusCode: 400,
                    message: 'Invalid reference to related record',
                };
            case 'P2014':
                return {
                    statusCode: 400,
                    message: 'Invalid ID provided',
                };
            case 'P2001':
                return {
                    statusCode: 404,
                    message: 'Record not found',
                };
            default:
                return {
                    statusCode: 500,
                    message: 'Database operation failed',
                };
        }
    }

    public static createError(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true
    ): AppError {
        const error: AppError = new Error(message);
        error.statusCode = statusCode;
        error.isOperational = isOperational;
        return error;
    }

    public static asyncHandler(
        fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
