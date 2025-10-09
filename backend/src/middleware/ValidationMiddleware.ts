import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ErrorHandler } from './ErrorHandler';

export class ValidationMiddleware {
    public static validate(req: Request, res: Response, next: NextFunction): void {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined,
            }));

            const validationError = ErrorHandler.createError(
                `Validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
                400,
                true
            );

            (validationError as any).details = errorMessages;
            return next(validationError);
        }

        next();
    }

    public static sanitizeInput(req: Request, res: Response, next: NextFunction): void {
        // Recursively sanitize all string inputs
        const sanitizeObject = (obj: any): any => {
            if (typeof obj === 'string') {
                return obj.trim();
            }

            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }

            if (obj && typeof obj === 'object') {
                const sanitized: any = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        sanitized[key] = sanitizeObject(obj[key]);
                    }
                }
                return sanitized;
            }

            return obj;
        };

        if (req.body) {
            req.body = sanitizeObject(req.body);
        }

        if (req.query) {
            req.query = sanitizeObject(req.query);
        }

        if (req.params) {
            req.params = sanitizeObject(req.params);
        }

        next();
    }

    public static validatePagination(req: Request, res: Response, next: NextFunction): void {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sortBy = req.query.sortBy as string || 'createdAt';
        const sortOrder = req.query.sortOrder as string || 'desc';

        // Validate page
        if (page < 1) {
            return next(ErrorHandler.createError('Page must be greater than 0', 400));
        }

        // Validate limit
        if (limit < 1 || limit > 100) {
            return next(ErrorHandler.createError('Limit must be between 1 and 100', 400));
        }

        // Validate sort order
        if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            return next(ErrorHandler.createError('Sort order must be asc or desc', 400));
        }

        // Add validated pagination to request
        (req as any).pagination = {
            page,
            limit,
            offset: (page - 1) * limit,
            sortBy,
            sortOrder: sortOrder.toLowerCase() as 'asc' | 'desc',
        };

        next();
    }

    public static validateFileUpload(
        allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
        maxSize: number = 5 * 1024 * 1024 // 5MB
    ) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.file) {
                return next();
            }

            // Check file type
            if (!allowedTypes.includes(req.file.mimetype)) {
                return next(ErrorHandler.createError(
                    `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
                    400
                ));
            }

            // Check file size
            if (req.file.size > maxSize) {
                return next(ErrorHandler.createError(
                    `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
                    400
                ));
            }

            next();
        };
    }
}
