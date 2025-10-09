"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const ErrorHandler_1 = require("./ErrorHandler");
class ValidationMiddleware {
    static validate(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined,
            }));
            const validationError = ErrorHandler_1.ErrorHandler.createError(`Validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`, 400, true);
            validationError.details = errorMessages;
            return next(validationError);
        }
        next();
    }
    static sanitizeInput(req, res, next) {
        const sanitizeObject = (obj) => {
            if (typeof obj === 'string') {
                return obj.trim();
            }
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            if (obj && typeof obj === 'object') {
                const sanitized = {};
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
    static validatePagination(req, res, next) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        if (page < 1) {
            return next(ErrorHandler_1.ErrorHandler.createError('Page must be greater than 0', 400));
        }
        if (limit < 1 || limit > 100) {
            return next(ErrorHandler_1.ErrorHandler.createError('Limit must be between 1 and 100', 400));
        }
        if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            return next(ErrorHandler_1.ErrorHandler.createError('Sort order must be asc or desc', 400));
        }
        req.pagination = {
            page,
            limit,
            offset: (page - 1) * limit,
            sortBy,
            sortOrder: sortOrder.toLowerCase(),
        };
        next();
    }
    static validateFileUpload(allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) {
        return (req, res, next) => {
            if (!req.file) {
                return next();
            }
            if (!allowedTypes.includes(req.file.mimetype)) {
                return next(ErrorHandler_1.ErrorHandler.createError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400));
            }
            if (req.file.size > maxSize) {
                return next(ErrorHandler_1.ErrorHandler.createError(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400));
            }
            next();
        };
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
//# sourceMappingURL=ValidationMiddleware.js.map