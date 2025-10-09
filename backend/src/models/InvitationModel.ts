import crypto from 'crypto';
import { Invitation, InvitationStatus, MemberRole, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface CreateInvitationData {
    organizationId: string;
    email: string;
    role: MemberRole;
    sentBy: string;
    expiresInDays?: number;
}

export class InvitationModel extends BaseModel<Invitation> {
    getTableName(): string {
        return 'invitation';
    }

    /**
     * Create a new invitation
     */
    public async createInvitation(data: CreateInvitationData): Promise<Invitation> {
        try {
            // Check if user already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser) {
                throw ErrorHandler.createError('User with this email already exists', 409);
            }

            // Check if there's a pending invitation for this organization
            const pendingInvitation = await this.prisma.invitation.findFirst({
                where: {
                    organizationId: data.organizationId,
                    email: data.email,
                    status: InvitationStatus.PENDING,
                    expiresAt: { gte: new Date() },
                },
            });

            if (pendingInvitation) {
                throw ErrorHandler.createError('An active invitation already exists for this email in this organization', 409);
            }

            // Generate unique token
            const token = crypto.randomBytes(32).toString('hex');

            // Set expiration (default 7 days)
            const expiresInDays = data.expiresInDays || 7;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiresInDays);

            const invitation = await this.prisma.invitation.create({
                data: {
                    organizationId: data.organizationId,
                    email: data.email,
                    role: data.role,
                    token,
                    sentBy: data.sentBy,
                    expiresAt,
                    status: InvitationStatus.PENDING,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            this.logOperation('CREATE', { id: invitation.id, email: invitation.email });
            return invitation;
        } catch (error) {
            this.logger.error('Error creating invitation:', error);
            throw error;
        }
    }

    /**
     * Get invitation by ID with relations
     */
    public async getInvitationById(id: string): Promise<Invitation | null> {
        try {
            const invitation = await this.prisma.invitation.findUnique({
                where: { id },
                include: {
                    sender: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return invitation;
        } catch (error) {
            this.logger.error('Error finding invitation by ID:', error);
            throw error;
        }
    }

    /**
     * Get invitation by token
     */
    public async getInvitationByToken(token: string): Promise<Invitation | null> {
        try {
            const invitation = await this.prisma.invitation.findUnique({
                where: { token },
                include: {
                    sender: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return invitation;
        } catch (error) {
            this.logger.error('Error finding invitation by token:', error);
            throw error;
        }
    }

    /**
     * Verify invitation token is valid
     */
    public async verifyInvitationToken(token: string): Promise<Invitation> {
        const invitation = await this.getInvitationByToken(token);

        if (!invitation) {
            throw ErrorHandler.createError('Invalid invitation token', 404);
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw ErrorHandler.createError('Invitation has already been used or cancelled', 400);
        }

        if (new Date() > invitation.expiresAt) {
            // Mark as expired
            await this.updateInvitationStatus(invitation.id, InvitationStatus.EXPIRED);
            throw ErrorHandler.createError('Invitation has expired', 400);
        }

        return invitation;
    }

    /**
     * Accept invitation
     */
    public async acceptInvitation(token: string): Promise<Invitation> {
        try {
            const invitation = await this.verifyInvitationToken(token);

            const updatedInvitation = await this.prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: InvitationStatus.ACCEPTED,
                    acceptedAt: new Date(),
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            this.logOperation('ACCEPT', { id: updatedInvitation.id, email: updatedInvitation.email });
            return updatedInvitation;
        } catch (error) {
            this.logger.error('Error accepting invitation:', error);
            throw error;
        }
    }

    /**
     * Update invitation status
     */
    public async updateInvitationStatus(
        id: string,
        status: InvitationStatus
    ): Promise<Invitation> {
        try {
            const invitation = await this.prisma.invitation.update({
                where: { id },
                data: { status },
            });

            this.logOperation('UPDATE_STATUS', { id, status });
            return invitation;
        } catch (error) {
            this.logger.error('Error updating invitation status:', error);
            throw error;
        }
    }

    /**
     * Cancel invitation
     */
    public async cancelInvitation(id: string, userId: string): Promise<Invitation> {
        try {
            const invitation = await this.prisma.invitation.findUnique({
                where: { id },
            });

            if (!invitation) {
                throw ErrorHandler.createError('Invitation not found', 404);
            }

            if (invitation.sentBy !== userId) {
                throw ErrorHandler.createError('You can only cancel invitations you sent', 403);
            }

            const updatedInvitation = await this.updateInvitationStatus(
                id,
                InvitationStatus.CANCELLED
            );

            this.logOperation('CANCEL', { id, email: invitation.email });
            return updatedInvitation;
        } catch (error) {
            this.logger.error('Error cancelling invitation:', error);
            throw error;
        }
    }

    /**
     * Get all invitations with filters
     */
    public async getInvitations(
        where: Prisma.InvitationWhereInput = {},
        options: Prisma.InvitationFindManyArgs = {}
    ): Promise<{ data: Invitation[]; total: number }> {
        try {
            const [data, total] = await Promise.all([
                this.prisma.invitation.findMany({
                    where,
                    ...options,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        organization: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                }),
                this.prisma.invitation.count({ where }),
            ]);

            return { data, total };
        } catch (error) {
            this.logger.error('Error getting invitations:', error);
            throw error;
        }
    }

    /**
     * Clean up expired invitations
     */
    public async cleanupExpiredInvitations(): Promise<number> {
        try {
            const result = await this.prisma.invitation.updateMany({
                where: {
                    status: InvitationStatus.PENDING,
                    expiresAt: { lt: new Date() },
                },
                data: {
                    status: InvitationStatus.EXPIRED,
                },
            });

            this.logger.info(`Marked ${result.count} invitations as expired`);
            return result.count;
        } catch (error) {
            this.logger.error('Error cleaning up expired invitations:', error);
            throw error;
        }
    }
}

