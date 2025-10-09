"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationModel = void 0;
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class InvitationModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'invitation';
    }
    async createInvitation(data) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw ErrorHandler_1.ErrorHandler.createError('User with this email already exists', 409);
            }
            const pendingInvitation = await this.prisma.invitation.findFirst({
                where: {
                    organizationId: data.organizationId,
                    email: data.email,
                    status: client_1.InvitationStatus.PENDING,
                    expiresAt: { gte: new Date() },
                },
            });
            if (pendingInvitation) {
                throw ErrorHandler_1.ErrorHandler.createError('An active invitation already exists for this email in this organization', 409);
            }
            const token = crypto_1.default.randomBytes(32).toString('hex');
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
                    status: client_1.InvitationStatus.PENDING,
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
        }
        catch (error) {
            this.logger.error('Error creating invitation:', error);
            throw error;
        }
    }
    async getInvitationById(id) {
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
        }
        catch (error) {
            this.logger.error('Error finding invitation by ID:', error);
            throw error;
        }
    }
    async getInvitationByToken(token) {
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
        }
        catch (error) {
            this.logger.error('Error finding invitation by token:', error);
            throw error;
        }
    }
    async verifyInvitationToken(token) {
        const invitation = await this.getInvitationByToken(token);
        if (!invitation) {
            throw ErrorHandler_1.ErrorHandler.createError('Invalid invitation token', 404);
        }
        if (invitation.status !== client_1.InvitationStatus.PENDING) {
            throw ErrorHandler_1.ErrorHandler.createError('Invitation has already been used or cancelled', 400);
        }
        if (new Date() > invitation.expiresAt) {
            await this.updateInvitationStatus(invitation.id, client_1.InvitationStatus.EXPIRED);
            throw ErrorHandler_1.ErrorHandler.createError('Invitation has expired', 400);
        }
        return invitation;
    }
    async acceptInvitation(token) {
        try {
            const invitation = await this.verifyInvitationToken(token);
            const updatedInvitation = await this.prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: client_1.InvitationStatus.ACCEPTED,
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
        }
        catch (error) {
            this.logger.error('Error accepting invitation:', error);
            throw error;
        }
    }
    async updateInvitationStatus(id, status) {
        try {
            const invitation = await this.prisma.invitation.update({
                where: { id },
                data: { status },
            });
            this.logOperation('UPDATE_STATUS', { id, status });
            return invitation;
        }
        catch (error) {
            this.logger.error('Error updating invitation status:', error);
            throw error;
        }
    }
    async cancelInvitation(id, userId) {
        try {
            const invitation = await this.prisma.invitation.findUnique({
                where: { id },
            });
            if (!invitation) {
                throw ErrorHandler_1.ErrorHandler.createError('Invitation not found', 404);
            }
            if (invitation.sentBy !== userId) {
                throw ErrorHandler_1.ErrorHandler.createError('You can only cancel invitations you sent', 403);
            }
            const updatedInvitation = await this.updateInvitationStatus(id, client_1.InvitationStatus.CANCELLED);
            this.logOperation('CANCEL', { id, email: invitation.email });
            return updatedInvitation;
        }
        catch (error) {
            this.logger.error('Error cancelling invitation:', error);
            throw error;
        }
    }
    async getInvitations(where = {}, options = {}) {
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
        }
        catch (error) {
            this.logger.error('Error getting invitations:', error);
            throw error;
        }
    }
    async cleanupExpiredInvitations() {
        try {
            const result = await this.prisma.invitation.updateMany({
                where: {
                    status: client_1.InvitationStatus.PENDING,
                    expiresAt: { lt: new Date() },
                },
                data: {
                    status: client_1.InvitationStatus.EXPIRED,
                },
            });
            this.logger.info(`Marked ${result.count} invitations as expired`);
            return result.count;
        }
        catch (error) {
            this.logger.error('Error cleaning up expired invitations:', error);
            throw error;
        }
    }
}
exports.InvitationModel = InvitationModel;
//# sourceMappingURL=InvitationModel.js.map