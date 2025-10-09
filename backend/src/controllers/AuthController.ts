import { Request, Response, NextFunction } from 'express';
import { UserModel } from '@/models/UserModel';
import { OrganizationModel } from '@/models/OrganizationModel';
import { InvitationModel } from '@/models/InvitationModel';
import { PasswordResetModel } from '@/models/PasswordResetModel';
import { EmailService } from '@/services/EmailService';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { Logger } from '@/utils/Logger';
import { catchAsync } from '@/utils/catchAsync';
import { MemberRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class AuthController {
    private userModel: UserModel;
    private organizationModel: OrganizationModel;
    private invitationModel: InvitationModel;
    private passwordResetModel: PasswordResetModel;
    private emailService: EmailService;
    private logger: Logger;

    constructor() {
        this.userModel = new UserModel();
        this.organizationModel = new OrganizationModel();
        this.invitationModel = new InvitationModel();
        this.passwordResetModel = new PasswordResetModel();
        this.emailService = new EmailService();
        this.logger = new Logger();
    }

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await this.userModel.findByEmail(email);
            if (!user) {
                return next(ErrorHandler.createError('Invalid email or password', 401));
            }

            // Check if user is active
            if (!user.isActive) {
                return next(ErrorHandler.createError('Account is deactivated', 401));
            }

            // Verify password
            const isPasswordValid = await this.userModel.verifyPassword(user, password);
            if (!isPasswordValid) {
                return next(ErrorHandler.createError('Invalid email or password', 401));
            }

            // Get user's workspaces
            const workspaces = await this.organizationModel.getUserOrganizations(user.id);

            // Generate tokens
            const { accessToken, refreshToken } = AuthMiddleware.generateTokens({
                id: user.id,
                email: user.email,
                username: user.username,
            });

            // Log successful login
            this.logger.info('User logged in successfully', {
                userId: user.id,
                email: user.email,
                workspaceCount: workspaces.length,
            });

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    },
                    workspaces,
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                },
                message: 'Login successful',
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Register - Creates user account and their own workspace
     */
    public register = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email, username, password, firstName, lastName, organizationName } = req.body;

        // Create user
        const user = await this.userModel.createUser({
            email,
            username,
            password,
            firstName,
            lastName,
        });

        // Create organization for the user
        const organization = await this.organizationModel.createOrganization({
            name: organizationName || `${firstName}'s Workspace`,
            ownerId: user.id,
        });

        // Get workspaces
        const workspaces = await this.organizationModel.getUserOrganizations(user.id);

        // Generate tokens
        const { accessToken, refreshToken } = AuthMiddleware.generateTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        // Log successful registration
        this.logger.info('User registered successfully', {
            userId: user.id,
            email: user.email,
            organizationId: organization.id,
            organizationName: organization.name,
            ip: req.ip,
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                workspaces,
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
            message: 'Registration successful',
        });
    });

    /**
     * Accept invitation and join workspace
     * If user doesn't exist, they register first
     */
    public acceptInvitation = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { token, username, password, firstName, lastName } = req.body;

        // Verify invitation token
        const invitation = await this.invitationModel.verifyInvitationToken(token);

        // Check if user already exists
        let user = await this.userModel.findByEmail(invitation.email);

        if (!user) {
            // Create new user if doesn't exist
            user = await this.userModel.createUser({
                email: invitation.email,
                username,
                password,
                firstName,
                lastName,
            });

            // Create their own workspace
            await this.organizationModel.createOrganization({
                name: `${firstName}'s Workspace`,
                ownerId: user.id,
            });
        }

        // Add user to the invited organization
        await this.organizationModel.addMember(
            invitation.organizationId,
            user.id,
            invitation.role
        );

        // Mark invitation as accepted
        await this.invitationModel.acceptInvitation(token);

        // Send welcome email
        try {
            await this.emailService.sendWelcomeEmail(
                user.email,
                user.firstName,
                (invitation as any).organization.name
            );
        } catch (emailError) {
            // Log error but don't fail the invitation acceptance
            this.logger.error('Failed to send welcome email:', emailError);
        }

        // Get user's workspaces
        const workspaces = await this.organizationModel.getUserOrganizations(user.id);

        // Generate tokens
        const { accessToken, refreshToken } = AuthMiddleware.generateTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        // Log successful acceptance
        this.logger.info('Invitation accepted', {
            userId: user.id,
            email: user.email,
            organizationId: invitation.organizationId,
            role: invitation.role,
            invitationId: invitation.id,
            ip: req.ip,
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                workspaces,
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
            message: 'Successfully joined workspace',
        });
    });

    /**
     * Verify invitation token (before registration)
     */
    public verifyInvitation = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { token } = req.params;

        const invitation = await this.invitationModel.verifyInvitationToken(token);

        res.status(200).json({
            success: true,
            data: {
                invitation: {
                    email: invitation.email,
                    role: invitation.role,
                    expiresAt: invitation.expiresAt,
                },
            },
            message: 'Invitation is valid',
        });
    });

    public refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { refreshToken } = req.body;

        // Verify refresh token
        const { userId } = AuthMiddleware.verifyRefreshToken(refreshToken);

        // Get user
        const user = await this.userModel.findById(userId);
        if (!user || !user.isActive) {
            throw ErrorHandler.createError('Invalid refresh token', 401);
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = AuthMiddleware.generateTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        res.status(200).json({
            success: true,
            data: {
                tokens: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
            },
            message: 'Token refreshed successfully',
        });
    });

    public logout = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        // In a real application, you might want to blacklist the token
        // For now, we'll just log the logout
        this.logger.info('User logged out', {
            userId: req.user?.id,
            ip: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    });

    public changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user!.id;

        await this.userModel.changePassword(userId, {
            currentPassword,
            newPassword,
        });

        this.logger.info('Password changed successfully', {
            userId,
            ip: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    });

    public getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw ErrorHandler.createError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    createdAt: user.createdAt,
                },
            },
        });
    });

    public updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user!.id;
        const { firstName, lastName, email } = req.body;

        const user = await this.userModel.updateUser(userId, {
            firstName,
            lastName,
            email,
        });

        this.logger.info('Profile updated successfully', {
            userId,
            ip: req.ip,
        });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            },
            message: 'Profile updated successfully',
        });
    });

    public verifyToken = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        res.status(200).json({
            success: true,
            data: {
                user: req.user,
            },
            message: 'Token is valid',
        });
    });

    /**
     * Request password reset - sends reset token
     */
    public forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email } = req.body;

        try {
            const passwordReset = await this.passwordResetModel.createPasswordResetToken({
                email,
                expiresInHours: 1,
            });

            // TODO: Send email with reset link
            // In a real application, you would send an email here
            // For now, we'll just return success and log the token
            this.logger.info('Password reset requested', {
                email,
                token: passwordReset.token,
                ip: req.ip,
            });

            // In production, you would NOT return the token in the response
            // This is only for development/testing purposes
            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${passwordReset.token}`;

            res.status(200).json({
                success: true,
                message: 'If the email exists, a password reset link has been sent',
                // Remove this in production
                ...(process.env.NODE_ENV !== 'production' && {
                    data: {
                        resetLink,
                        token: passwordReset.token,
                    },
                }),
            });
        } catch (error: any) {
            // Don't reveal if email exists or not
            if (error.statusCode === 200) {
                res.status(200).json({
                    success: true,
                    message: 'If the email exists, a password reset link has been sent',
                });
            } else {
                throw error;
            }
        }
    });

    /**
     * Reset password using token
     */
    public resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { token, newPassword } = req.body;

        // Verify token
        const passwordReset = await this.passwordResetModel.verifyPasswordResetToken(token);

        // Get user
        const user = await this.userModel.findByEmail(passwordReset.email);
        if (!user) {
            return next(ErrorHandler.createError('User not found', 404));
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.userModel.update(user.id, { password: hashedPassword });

        // Mark token as used
        await this.passwordResetModel.markAsUsed(token);

        this.logger.info('Password reset successfully', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
        });

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully',
        });
    });

    /**
     * Verify password reset token
     */
    public verifyResetToken = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { token } = req.params;

        await this.passwordResetModel.verifyPasswordResetToken(token);

        res.status(200).json({
            success: true,
            message: 'Reset token is valid',
        });
    });
}
