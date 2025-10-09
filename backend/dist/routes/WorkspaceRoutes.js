"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const OrganizationModel_1 = require("@/models/OrganizationModel");
const InvitationModel_1 = require("@/models/InvitationModel");
const EmailService_1 = require("@/services/EmailService");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
const catchAsync_1 = require("@/utils/catchAsync");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class WorkspaceRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.organizationModel = new OrganizationModel_1.OrganizationModel();
        this.invitationModel = new InvitationModel_1.InvitationModel();
        this.emailService = new EmailService_1.EmailService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res) => {
            const workspaces = await this.organizationModel.getUserOrganizations(req.user.id);
            res.json({
                success: true,
                data: { workspaces },
            });
        }));
        this.router.post('/', [
            (0, express_validator_1.body)('name')
                .trim()
                .isLength({ min: 1, max: 100 })
                .withMessage('Workspace name is required and must be less than 100 characters'),
            (0, express_validator_1.body)('description')
                .optional()
                .trim()
                .isLength({ max: 500 })
                .withMessage('Description must be less than 500 characters'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res) => {
            const { name, description } = req.body;
            const workspace = await this.organizationModel.createOrganization({
                name,
                description,
                ownerId: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { workspace },
                message: 'Workspace created successfully',
            });
        }));
        this.router.get('/:id', [(0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required')], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id } = req.params;
            const hasAccess = await this.organizationModel.hasAccess(id, req.user.id);
            if (!hasAccess) {
                return next(ErrorHandler_1.ErrorHandler.createError('Access denied to this workspace', 403));
            }
            const workspace = await this.organizationModel.getOrganizationWithMembers(id);
            res.json({
                success: true,
                data: { workspace },
            });
        }));
        this.router.patch('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.body)('name')
                .optional()
                .trim()
                .isLength({ min: 1, max: 100 })
                .withMessage('Workspace name must be 1-100 characters'),
            (0, express_validator_1.body)('description')
                .optional()
                .trim()
                .isLength({ max: 500 })
                .withMessage('Description must be less than 500 characters'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id } = req.params;
            const { name, description } = req.body;
            const isOwner = await this.organizationModel.isOwner(id, req.user.id);
            if (!isOwner) {
                return next(ErrorHandler_1.ErrorHandler.createError('Only workspace owner can update workspace details', 403));
            }
            const workspace = await this.organizationModel.updateOrganization(id, {
                name,
                description,
            });
            res.json({
                success: true,
                data: { workspace },
                message: 'Workspace updated successfully',
            });
        }));
        this.router.delete('/:id', [(0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required')], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id } = req.params;
            const isOwner = await this.organizationModel.isOwner(id, req.user.id);
            if (!isOwner) {
                return next(ErrorHandler_1.ErrorHandler.createError('Only workspace owner can delete workspace', 403));
            }
            await this.organizationModel.deleteOrganization(id);
            res.json({
                success: true,
                message: 'Workspace deleted successfully',
            });
        }));
        this.router.get('/:id/members', [(0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required')], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id } = req.params;
            const hasAccess = await this.organizationModel.hasAccess(id, req.user.id);
            if (!hasAccess) {
                return next(ErrorHandler_1.ErrorHandler.createError('Access denied', 403));
            }
            const workspace = await this.organizationModel.getOrganizationWithMembers(id);
            res.json({
                success: true,
                data: {
                    members: workspace.members,
                    count: workspace.members.length,
                },
            });
        }));
        this.router.post('/:id/invite', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.body)('email')
                .isEmail()
                .normalizeEmail()
                .withMessage('Valid email is required'),
            (0, express_validator_1.body)('role')
                .optional()
                .isIn(['ADMIN', 'MEMBER'])
                .withMessage('Role must be ADMIN or MEMBER'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id: organizationId } = req.params;
            const { email, role = 'MEMBER' } = req.body;
            const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(organizationId, req.user.id);
            if (!isOwnerOrAdmin) {
                return next(ErrorHandler_1.ErrorHandler.createError('Only owner or admin can invite members', 403));
            }
            const canInvite = await this.organizationModel.canInviteMore(organizationId);
            if (!canInvite) {
                return next(ErrorHandler_1.ErrorHandler.createError('Workspace has reached maximum member limit (3 members total)', 400));
            }
            const invitation = await this.invitationModel.createInvitation({
                organizationId,
                email,
                role,
                sentBy: req.user.id,
            });
            try {
                await this.emailService.sendInvitationEmail(invitation);
            }
            catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
            }
            const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${invitation.token}`;
            res.status(201).json({
                success: true,
                data: {
                    invitation,
                    ...(process.env.NODE_ENV !== 'production' && { invitationLink }),
                },
                message: 'Invitation sent successfully',
            });
        }));
        this.router.patch('/:id/members/:userId/role', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.param)('userId').isString().withMessage('User ID is required'),
            (0, express_validator_1.body)('role')
                .isIn(['OWNER', 'ADMIN', 'MEMBER'])
                .withMessage('Role must be OWNER, ADMIN, or MEMBER'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id: organizationId, userId } = req.params;
            const { role } = req.body;
            const isOwner = await this.organizationModel.isOwner(organizationId, req.user.id);
            if (!isOwner) {
                return next(ErrorHandler_1.ErrorHandler.createError('Only workspace owner can change member roles', 403));
            }
            await this.organizationModel.updateMemberRole(organizationId, userId, role);
            res.json({
                success: true,
                message: 'Member role updated successfully',
            });
        }));
        this.router.delete('/:id/members/:userId', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.param)('userId').isString().withMessage('User ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id: organizationId, userId } = req.params;
            const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(organizationId, req.user.id);
            if (!isOwnerOrAdmin) {
                return next(ErrorHandler_1.ErrorHandler.createError('Only owner or admin can remove members', 403));
            }
            await this.organizationModel.removeMember(organizationId, userId);
            res.json({
                success: true,
                message: 'Member removed successfully',
            });
        }));
        this.router.get('/:id/invitations', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.query)('status')
                .optional()
                .isIn(['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'])
                .withMessage('Invalid status'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id: organizationId } = req.params;
            const { status } = req.query;
            const hasAccess = await this.organizationModel.hasAccess(organizationId, req.user.id);
            if (!hasAccess) {
                return next(ErrorHandler_1.ErrorHandler.createError('Access denied', 403));
            }
            const where = { organizationId };
            if (status) {
                where.status = status;
            }
            const { data: invitations } = await this.invitationModel.getInvitations(where, {
                orderBy: { createdAt: 'desc' },
            });
            res.json({
                success: true,
                data: { invitations },
            });
        }));
        this.router.post('/:id/invitations/:invitationId/resend', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.param)('invitationId').isString().withMessage('Invitation ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id: organizationId, invitationId } = req.params;
            const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(organizationId, req.user.id);
            if (!isOwnerOrAdmin) {
                return next(ErrorHandler_1.ErrorHandler.createError('Access denied', 403));
            }
            const invitation = await this.invitationModel.getInvitationById(invitationId);
            if (!invitation) {
                return next(ErrorHandler_1.ErrorHandler.createError('Invitation not found', 404));
            }
            if (invitation.organizationId !== organizationId) {
                return next(ErrorHandler_1.ErrorHandler.createError('Invitation does not belong to this workspace', 403));
            }
            if (invitation.status !== 'PENDING') {
                return next(ErrorHandler_1.ErrorHandler.createError('Can only resend pending invitations', 400));
            }
            try {
                await this.emailService.sendInvitationEmail(invitation);
                res.json({
                    success: true,
                    message: 'Invitation email resent successfully',
                });
            }
            catch (emailError) {
                console.error('Failed to resend invitation email:', {
                    error: emailError?.message || String(emailError),
                    code: emailError?.code,
                    response: emailError?.response,
                    stack: emailError?.stack
                });
                return next(ErrorHandler_1.ErrorHandler.createError('Failed to send invitation email: ' + (emailError?.message || 'Unknown error'), 500));
            }
        }));
        this.router.delete('/:id/invitations/:invitationId', [
            (0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required'),
            (0, express_validator_1.param)('invitationId').isString().withMessage('Invitation ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { id: organizationId, invitationId } = req.params;
            const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(organizationId, req.user.id);
            if (!isOwnerOrAdmin) {
                return next(ErrorHandler_1.ErrorHandler.createError('Access denied', 403));
            }
            await this.invitationModel.cancelInvitation(invitationId, req.user.id);
            res.json({
                success: true,
                message: 'Invitation cancelled successfully',
            });
        }));
        this.router.post('/:id/test-email', [(0, express_validator_1.param)('id').isString().withMessage('Workspace ID is required')], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const hasAccess = await this.organizationModel.hasAccess(req.params.id, req.user.id);
            if (!hasAccess) {
                return next(ErrorHandler_1.ErrorHandler.createError('Access denied', 403));
            }
            try {
                const connectionVerified = await this.emailService.verifyConnection();
                if (!connectionVerified) {
                    return res.status(500).json({
                        success: false,
                        message: 'Email connection verification failed'
                    });
                }
                const emailSent = await this.emailService.testEmailSending();
                if (!emailSent) {
                    return res.status(500).json({
                        success: false,
                        message: 'Test email sending failed'
                    });
                }
                res.json({
                    success: true,
                    message: 'Email configuration test successful - check your inbox for test email'
                });
            }
            catch (error) {
                console.error('Email test failed:', error);
                res.status(500).json({
                    success: false,
                    message: 'Email test failed: ' + (error?.message || 'Unknown error')
                });
            }
        }));
    }
    getRouter() {
        return this.router;
    }
}
exports.WorkspaceRoutes = WorkspaceRoutes;
//# sourceMappingURL=WorkspaceRoutes.js.map