"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DatabaseService_1 = require("@/services/DatabaseService");
const ErrorHandler_1 = require("./ErrorHandler");
class AuthMiddleware {
    static async authenticate(req, res, next) {
        try {
            const token = AuthMiddleware.extractToken(req);
            if (!token) {
                throw ErrorHandler_1.ErrorHandler.createError('Access token is required', 401);
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const prisma = AuthMiddleware.databaseService.getClient();
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    isActive: true,
                },
            });
            if (!user || !user.isActive) {
                throw ErrorHandler_1.ErrorHandler.createError('User not found or inactive', 401);
            }
            req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
            };
            req.organizationId = req.headers['x-organization-id'];
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                next(ErrorHandler_1.ErrorHandler.createError('Invalid token', 401));
            }
            else {
                next(error);
            }
        }
    }
    static requireOrganization() {
        return (req, res, next) => {
            if (!req.user) {
                return next(ErrorHandler_1.ErrorHandler.createError('Authentication required', 401));
            }
            if (!req.organizationId) {
                return next(ErrorHandler_1.ErrorHandler.createError('Organization context required', 400));
            }
            next();
        };
    }
    static authorize(...roles) {
        return (req, res, next) => {
            if (!req.user) {
                return next(ErrorHandler_1.ErrorHandler.createError('Authentication required', 401));
            }
            next();
        };
    }
    static optionalAuth(req, res, next) {
        const token = AuthMiddleware.extractToken(req);
        if (!token) {
            return next();
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.userId,
                email: decoded.email,
                username: decoded.username,
            };
        }
        catch (error) {
        }
        next();
    }
    static extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
    static generateTokens(user) {
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
        return { accessToken, refreshToken };
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    }
}
exports.AuthMiddleware = AuthMiddleware;
AuthMiddleware.databaseService = DatabaseService_1.DatabaseService.getInstance();
//# sourceMappingURL=AuthMiddleware.js.map