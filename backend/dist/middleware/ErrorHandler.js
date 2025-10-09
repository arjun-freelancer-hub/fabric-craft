"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const client_1 = require("@prisma/client");
class ErrorHandler {
    static logError(error, req) {
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
    static handle(error, req, res, next) {
        let statusCode = error.statusCode || 500;
        let message = error.message || 'Internal Server Error';
        let isOperational = error.isOperational || false;
        ErrorHandler.logError(error, req);
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const prismaError = ErrorHandler.handlePrismaError(error);
            statusCode = prismaError.statusCode;
            message = prismaError.message;
            isOperational = true;
        }
        else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
            statusCode = 400;
            message = 'Invalid data provided';
            isOperational = true;
        }
        else if (error.name === 'ValidationError') {
            statusCode = 400;
            message = 'Validation failed';
            isOperational = true;
        }
        else if (error.name === 'UnauthorizedError') {
            statusCode = 401;
            message = 'Unauthorized access';
            isOperational = true;
        }
        else if (error.name === 'ForbiddenError') {
            statusCode = 403;
            message = 'Access forbidden';
            isOperational = true;
        }
        else if (error.name === 'NotFoundError') {
            statusCode = 404;
            message = 'Resource not found';
            isOperational = true;
        }
        else if (error.name === 'ConflictError') {
            statusCode = 409;
            message = 'Resource conflict';
            isOperational = true;
        }
        const errorResponse = {
            success: false,
            error: {
                message,
                ...(process.env.NODE_ENV === 'development' && {
                    stack: error.stack,
                    details: error,
                }),
            },
        };
        if (req.headers['x-request-id']) {
            errorResponse.requestId = req.headers['x-request-id'];
        }
        res.status(statusCode).json(errorResponse);
    }
    static handlePrismaError(error) {
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
    static createError(message, statusCode = 500, isOperational = true) {
        const error = new Error(message);
        error.statusCode = statusCode;
        error.isOperational = isOperational;
        return error;
    }
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map