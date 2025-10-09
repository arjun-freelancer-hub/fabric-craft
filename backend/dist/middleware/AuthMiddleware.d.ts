import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
    organizationId?: string;
}
export declare class AuthMiddleware {
    private static databaseService;
    static authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static requireOrganization(): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    static authorize(...roles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
    static optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    private static extractToken;
    static generateTokens(user: {
        id: string;
        email: string;
        username: string;
    }): {
        accessToken: string;
        refreshToken: string;
    };
    static verifyRefreshToken(token: string): {
        userId: string;
    };
}
//# sourceMappingURL=AuthMiddleware.d.ts.map