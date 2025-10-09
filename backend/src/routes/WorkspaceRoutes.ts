import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { OrganizationModel } from '@/models/OrganizationModel';
import { InvitationModel } from '@/models/InvitationModel';
import { EmailService } from '@/services/EmailService';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware, AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { catchAsync } from '@/utils/catchAsync';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export class WorkspaceRoutes {
    private router: Router;
    private organizationModel: OrganizationModel;
    private invitationModel: InvitationModel;
    private emailService: EmailService;

    constructor() {
        this.router = Router();
        this.organizationModel = new OrganizationModel();
        this.invitationModel = new InvitationModel();
        this.emailService = new EmailService();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get user's workspaces
        this.router.get(
            '/',
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res) => {
                const workspaces = await this.organizationModel.getUserOrganizations(req.user!.id);
                res.json({
                    success: true,
                    data: { workspaces },
                });
            })
        );

        // Create new workspace
        this.router.post(
            '/',
            [
                body('name')
                    .trim()
                    .isLength({ min: 1, max: 100 })
                    .withMessage('Workspace name is required and must be less than 100 characters'),
                body('description')
                    .optional()
                    .trim()
                    .isLength({ max: 500 })
                    .withMessage('Description must be less than 500 characters'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res) => {
                const { name, description } = req.body;

                const workspace = await this.organizationModel.createOrganization({
                    name,
                    description,
                    ownerId: req.user!.id,
                });

                res.status(201).json({
                    success: true,
                    data: { workspace },
                    message: 'Workspace created successfully',
                });
            })
        );

        // Get workspace details with members
        this.router.get(
            '/:id',
            [param('id').isString().withMessage('Workspace ID is required')],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id } = req.params;

                // Check if user has access to this workspace
                const hasAccess = await this.organizationModel.hasAccess(id, req.user!.id);
                if (!hasAccess) {
                    return next(ErrorHandler.createError('Access denied to this workspace', 403));
                }

                const workspace = await this.organizationModel.getOrganizationWithMembers(id);

                res.json({
                    success: true,
                    data: { workspace },
                });
            })
        );

        // Update workspace
        this.router.patch(
            '/:id',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                body('name')
                    .optional()
                    .trim()
                    .isLength({ min: 1, max: 100 })
                    .withMessage('Workspace name must be 1-100 characters'),
                body('description')
                    .optional()
                    .trim()
                    .isLength({ max: 500 })
                    .withMessage('Description must be less than 500 characters'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id } = req.params;
                const { name, description } = req.body;

                // Only owner can update workspace
                const isOwner = await this.organizationModel.isOwner(id, req.user!.id);
                if (!isOwner) {
                    return next(ErrorHandler.createError('Only workspace owner can update workspace details', 403));
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
            })
        );

        // Delete workspace (soft delete)
        this.router.delete(
            '/:id',
            [param('id').isString().withMessage('Workspace ID is required')],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id } = req.params;

                // Only owner can delete workspace
                const isOwner = await this.organizationModel.isOwner(id, req.user!.id);
                if (!isOwner) {
                    return next(ErrorHandler.createError('Only workspace owner can delete workspace', 403));
                }

                await this.organizationModel.deleteOrganization(id);

                res.json({
                    success: true,
                    message: 'Workspace deleted successfully',
                });
            })
        );

        // ===== MEMBER MANAGEMENT =====

        // Get workspace members
        this.router.get(
            '/:id/members',
            [param('id').isString().withMessage('Workspace ID is required')],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id } = req.params;

                // Check if user has access
                const hasAccess = await this.organizationModel.hasAccess(id, req.user!.id);
                if (!hasAccess) {
                    return next(ErrorHandler.createError('Access denied', 403));
                }

                const workspace = await this.organizationModel.getOrganizationWithMembers(id);

                res.json({
                    success: true,
                    data: {
                        members: workspace.members,
                        count: workspace.members.length,
                    },
                });
            })
        );

        // Invite member to workspace
        this.router.post(
            '/:id/invite',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                body('email')
                    .isEmail()
                    .normalizeEmail()
                    .withMessage('Valid email is required'),
                body('role')
                    .optional()
                    .isIn(['ADMIN', 'MEMBER'])
                    .withMessage('Role must be ADMIN or MEMBER'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id: organizationId } = req.params;
                const { email, role = 'MEMBER' } = req.body;

                // Check if user is owner or admin
                const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(
                    organizationId,
                    req.user!.id
                );
                if (!isOwnerOrAdmin) {
                    return next(
                        ErrorHandler.createError('Only owner or admin can invite members', 403)
                    );
                }

                // Check member limit
                const canInvite = await this.organizationModel.canInviteMore(organizationId);
                if (!canInvite) {
                    return next(
                        ErrorHandler.createError(
                            'Workspace has reached maximum member limit (3 members total)',
                            400
                        )
                    );
                }

                // Create invitation
                const invitation = await this.invitationModel.createInvitation({
                    organizationId,
                    email,
                    role,
                    sentBy: req.user!.id,
                });

                // Send invitation email
                try {
                    await this.emailService.sendInvitationEmail(invitation as any);
                } catch (emailError) {
                    // Log error but don't fail the invitation creation
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
            })
        );

        // Update member role
        this.router.patch(
            '/:id/members/:userId/role',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                param('userId').isString().withMessage('User ID is required'),
                body('role')
                    .isIn(['OWNER', 'ADMIN', 'MEMBER'])
                    .withMessage('Role must be OWNER, ADMIN, or MEMBER'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id: organizationId, userId } = req.params;
                const { role } = req.body;

                // Only owner can change roles
                const isOwner = await this.organizationModel.isOwner(organizationId, req.user!.id);
                if (!isOwner) {
                    return next(ErrorHandler.createError('Only workspace owner can change member roles', 403));
                }

                await this.organizationModel.updateMemberRole(organizationId, userId, role);

                res.json({
                    success: true,
                    message: 'Member role updated successfully',
                });
            })
        );

        // Remove member from workspace
        this.router.delete(
            '/:id/members/:userId',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                param('userId').isString().withMessage('User ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id: organizationId, userId } = req.params;

                // Only owner or admin can remove members
                const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(
                    organizationId,
                    req.user!.id
                );
                if (!isOwnerOrAdmin) {
                    return next(ErrorHandler.createError('Only owner or admin can remove members', 403));
                }

                await this.organizationModel.removeMember(organizationId, userId);

                res.json({
                    success: true,
                    message: 'Member removed successfully',
                });
            })
        );

        // ===== INVITATION MANAGEMENT =====

        // Get workspace invitations
        this.router.get(
            '/:id/invitations',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                query('status')
                    .optional()
                    .isIn(['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'])
                    .withMessage('Invalid status'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id: organizationId } = req.params;
                const { status } = req.query;

                // Check if user has access
                const hasAccess = await this.organizationModel.hasAccess(organizationId, req.user!.id);
                if (!hasAccess) {
                    return next(ErrorHandler.createError('Access denied', 403));
                }

                const where: any = { organizationId };
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
            })
        );

        // Resend invitation
        this.router.post(
            '/:id/invitations/:invitationId/resend',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                param('invitationId').isString().withMessage('Invitation ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id: organizationId, invitationId } = req.params;

                // Check if user has access
                const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(
                    organizationId,
                    req.user!.id
                );
                if (!isOwnerOrAdmin) {
                    return next(ErrorHandler.createError('Access denied', 403));
                }

                // Get invitation details with relations
                const invitation = await this.invitationModel.getInvitationById(invitationId);
                if (!invitation) {
                    return next(ErrorHandler.createError('Invitation not found', 404));
                }

                if (invitation.organizationId !== organizationId) {
                    return next(ErrorHandler.createError('Invitation does not belong to this workspace', 403));
                }

                if (invitation.status !== 'PENDING') {
                    return next(ErrorHandler.createError('Can only resend pending invitations', 400));
                }

                // Resend invitation email
                try {
                    await this.emailService.sendInvitationEmail(invitation as any);
                    res.json({
                        success: true,
                        message: 'Invitation email resent successfully',
                    });
                } catch (emailError: any) {
                    console.error('Failed to resend invitation email:', {
                        error: emailError?.message || String(emailError),
                        code: emailError?.code,
                        response: emailError?.response,
                        stack: emailError?.stack
                    });
                    return next(ErrorHandler.createError('Failed to send invitation email: ' + (emailError?.message || 'Unknown error'), 500));
                }
            })
        );

        // Cancel invitation
        this.router.delete(
            '/:id/invitations/:invitationId',
            [
                param('id').isString().withMessage('Workspace ID is required'),
                param('invitationId').isString().withMessage('Invitation ID is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                const { id: organizationId, invitationId } = req.params;

                // Check if user has access
                const isOwnerOrAdmin = await this.organizationModel.isOwnerOrAdmin(
                    organizationId,
                    req.user!.id
                );
                if (!isOwnerOrAdmin) {
                    return next(ErrorHandler.createError('Access denied', 403));
                }

                await this.invitationModel.cancelInvitation(invitationId, req.user!.id);

                res.json({
                    success: true,
                    message: 'Invitation cancelled successfully',
                });
            })
        );

        // Test email configuration endpoint
        this.router.post(
            '/:id/test-email',
            [param('id').isString().withMessage('Workspace ID is required')],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            catchAsync(async (req: AuthenticatedRequest, res, next) => {
                // Check if user has access
                const hasAccess = await this.organizationModel.hasAccess(req.params.id, req.user!.id);
                if (!hasAccess) {
                    return next(ErrorHandler.createError('Access denied', 403));
                }

                try {
                    // Test email connection
                    const connectionVerified = await this.emailService.verifyConnection();
                    if (!connectionVerified) {
                        return res.status(500).json({
                            success: false,
                            message: 'Email connection verification failed'
                        });
                    }

                    // Test email sending
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
                } catch (error: any) {
                    console.error('Email test failed:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Email test failed: ' + (error?.message || 'Unknown error')
                    });
                }
            })
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}

