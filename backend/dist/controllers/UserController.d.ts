import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class UserController {
    private userModel;
    private logger;
    constructor();
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    searchUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map