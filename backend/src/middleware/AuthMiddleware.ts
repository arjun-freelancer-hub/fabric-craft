import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '@/services/DatabaseService';
import { ErrorHandler } from './ErrorHandler';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
    organizationId?: string;
}

export class AuthMiddleware {
    private static databaseService = DatabaseService.getInstance();

    public static async authenticate(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const token = AuthMiddleware.extractToken(req);

            if (!token) {
                throw ErrorHandler.createError('Access token is required', 401);
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

            // Verify user still exists and is active
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
                throw ErrorHandler.createError('User not found or inactive', 401);
            }

            req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
            };

            // Extract organization ID from header if present
            req.organizationId = req.headers['x-organization-id'] as string;

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(ErrorHandler.createError('Invalid token', 401));
            } else {
                next(error);
            }
        }
    }

    /**
     * Check if organization ID is provided
     */
    public static requireOrganization() {
        return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
            if (!req.user) {
                return next(ErrorHandler.createError('Authentication required', 401));
            }

            if (!req.organizationId) {
                return next(ErrorHandler.createError('Organization context required', 400));
            }

            next();
        };
    }

    /**
     * Simplified authorize - just requires authentication
     * Role checks now done at workspace level via OrganizationModel
     */
    public static authorize(...roles: string[]) {
        return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
            if (!req.user) {
                return next(ErrorHandler.createError('Authentication required', 401));
            }
            // In multi-tenant system, role checks are done at workspace level
            // This method now just ensures user is authenticated
            next();
        };
    }

    public static optionalAuth(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): void {
        const token = AuthMiddleware.extractToken(req);

        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            req.user = {
                id: decoded.userId,
                email: decoded.email,
                username: decoded.username,
            };
        } catch (error) {
            // Ignore token errors for optional auth
        }

        next();
    }

    private static extractToken(req: Request): string | null {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        return null;
    }

    public static generateTokens(user: {
        id: string;
        email: string;
        username: string;
    }): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                username: user.username,
            },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as any
        );

        return { accessToken, refreshToken };
    }

    public static verifyRefreshToken(token: string): { userId: string } {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    }
}
