"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const UserModel_1 = require("@/models/UserModel");
const OrganizationModel_1 = require("@/models/OrganizationModel");
const InvitationModel_1 = require("@/models/InvitationModel");
const PasswordResetModel_1 = require("@/models/PasswordResetModel");
const EmailService_1 = require("@/services/EmailService");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
const catchAsync_1 = require("@/utils/catchAsync");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController {
    constructor() {
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                const user = await this.userModel.findByEmail(email);
                if (!user) {
                    return next(ErrorHandler_1.ErrorHandler.createError('Invalid email or password', 401));
                }
                if (!user.isActive) {
                    return next(ErrorHandler_1.ErrorHandler.createError('Account is deactivated', 401));
                }
                const isPasswordValid = await this.userModel.verifyPassword(user, password);
                if (!isPasswordValid) {
                    return next(ErrorHandler_1.ErrorHandler.createError('Invalid email or password', 401));
                }
                const workspaces = await this.organizationModel.getUserOrganizations(user.id);
                const { accessToken, refreshToken } = AuthMiddleware_1.AuthMiddleware.generateTokens({
                    id: user.id,
                    email: user.email,
                    username: user.username,
                });
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
            }
            catch (error) {
                next(error);
            }
        };
        this.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { email, username, password, firstName, lastName, organizationName } = req.body;
            const user = await this.userModel.createUser({
                email,
                username,
                password,
                firstName,
                lastName,
            });
            const organization = await this.organizationModel.createOrganization({
                name: organizationName || `${firstName}'s Workspace`,
                ownerId: user.id,
            });
            const workspaces = await this.organizationModel.getUserOrganizations(user.id);
            const { accessToken, refreshToken } = AuthMiddleware_1.AuthMiddleware.generateTokens({
                id: user.id,
                email: user.email,
                username: user.username,
            });
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
        this.acceptInvitation = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { token, username, password, firstName, lastName } = req.body;
            const invitation = await this.invitationModel.verifyInvitationToken(token);
            let user = await this.userModel.findByEmail(invitation.email);
            if (!user) {
                user = await this.userModel.createUser({
                    email: invitation.email,
                    username,
                    password,
                    firstName,
                    lastName,
                });
                await this.organizationModel.createOrganization({
                    name: `${firstName}'s Workspace`,
                    ownerId: user.id,
                });
            }
            await this.organizationModel.addMember(invitation.organizationId, user.id, invitation.role);
            await this.invitationModel.acceptInvitation(token);
            try {
                await this.emailService.sendWelcomeEmail(user.email, user.firstName, invitation.organization.name);
            }
            catch (emailError) {
                this.logger.error('Failed to send welcome email:', emailError);
            }
            const workspaces = await this.organizationModel.getUserOrganizations(user.id);
            const { accessToken, refreshToken } = AuthMiddleware_1.AuthMiddleware.generateTokens({
                id: user.id,
                email: user.email,
                username: user.username,
            });
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
        this.verifyInvitation = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
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
        this.refreshToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { refreshToken } = req.body;
            const { userId } = AuthMiddleware_1.AuthMiddleware.verifyRefreshToken(refreshToken);
            const user = await this.userModel.findById(userId);
            if (!user || !user.isActive) {
                throw ErrorHandler_1.ErrorHandler.createError('Invalid refresh token', 401);
            }
            const { accessToken, refreshToken: newRefreshToken } = AuthMiddleware_1.AuthMiddleware.generateTokens({
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
        this.logout = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            this.logger.info('User logged out', {
                userId: req.user?.id,
                ip: req.ip,
            });
            res.status(200).json({
                success: true,
                message: 'Logout successful',
            });
        });
        this.changePassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
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
        this.getProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const userId = req.user.id;
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw ErrorHandler_1.ErrorHandler.createError('User not found', 404);
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
        this.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const userId = req.user.id;
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
        this.verifyToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            res.status(200).json({
                success: true,
                data: {
                    user: req.user,
                },
                message: 'Token is valid',
            });
        });
        this.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { email } = req.body;
            try {
                const passwordReset = await this.passwordResetModel.createPasswordResetToken({
                    email,
                    expiresInHours: 1,
                });
                this.logger.info('Password reset requested', {
                    email,
                    token: passwordReset.token,
                    ip: req.ip,
                });
                const resetLink = `${process.env.FRONTEND_URL}/reset-password/${passwordReset.token}`;
                res.status(200).json({
                    success: true,
                    message: 'If the email exists, a password reset link has been sent',
                    ...(process.env.NODE_ENV !== 'production' && {
                        data: {
                            resetLink,
                            token: passwordReset.token,
                        },
                    }),
                });
            }
            catch (error) {
                if (error.statusCode === 200) {
                    res.status(200).json({
                        success: true,
                        message: 'If the email exists, a password reset link has been sent',
                    });
                }
                else {
                    throw error;
                }
            }
        });
        this.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { token, newPassword } = req.body;
            const passwordReset = await this.passwordResetModel.verifyPasswordResetToken(token);
            const user = await this.userModel.findByEmail(passwordReset.email);
            if (!user) {
                return next(ErrorHandler_1.ErrorHandler.createError('User not found', 404));
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await this.userModel.update(user.id, { password: hashedPassword });
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
        this.verifyResetToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { token } = req.params;
            await this.passwordResetModel.verifyPasswordResetToken(token);
            res.status(200).json({
                success: true,
                message: 'Reset token is valid',
            });
        });
        this.userModel = new UserModel_1.UserModel();
        this.organizationModel = new OrganizationModel_1.OrganizationModel();
        this.invitationModel = new InvitationModel_1.InvitationModel();
        this.passwordResetModel = new PasswordResetModel_1.PasswordResetModel();
        this.emailService = new EmailService_1.EmailService();
        this.logger = new Logger_1.Logger();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map