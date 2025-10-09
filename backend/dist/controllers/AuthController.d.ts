import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private userModel;
    private organizationModel;
    private invitationModel;
    private passwordResetModel;
    private emailService;
    private logger;
    constructor();
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    register: (req: Request, res: Response, next: NextFunction) => void;
    acceptInvitation: (req: Request, res: Response, next: NextFunction) => void;
    verifyInvitation: (req: Request, res: Response, next: NextFunction) => void;
    refreshToken: (req: Request, res: Response, next: NextFunction) => void;
    logout: (req: Request, res: Response, next: NextFunction) => void;
    changePassword: (req: Request, res: Response, next: NextFunction) => void;
    getProfile: (req: Request, res: Response, next: NextFunction) => void;
    updateProfile: (req: Request, res: Response, next: NextFunction) => void;
    verifyToken: (req: Request, res: Response, next: NextFunction) => void;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    verifyResetToken: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=AuthController.d.ts.map