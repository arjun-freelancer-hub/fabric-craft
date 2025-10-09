"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModel = void 0;
const client_1 = require("@prisma/client");
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class OrganizationModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'organization';
    }
    async createOrganization(data) {
        try {
            const organization = await this.prisma.organization.create({
                data: {
                    name: data.name,
                    description: data.description,
                    ownerId: data.ownerId,
                    members: {
                        create: {
                            userId: data.ownerId,
                            role: client_1.MemberRole.OWNER,
                            isActive: true,
                        },
                    },
                },
                include: {
                    members: true,
                },
            });
            this.logOperation('CREATE', { id: organization.id, name: organization.name });
            return organization;
        }
        catch (error) {
            this.logger.error('Error creating organization:', error);
            throw error;
        }
    }
    async getUserOrganizations(userId) {
        try {
            const memberships = await this.prisma.organizationMember.findMany({
                where: {
                    userId,
                    isActive: true,
                },
                include: {
                    organization: {
                        include: {
                            _count: {
                                select: {
                                    members: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    joinedAt: 'desc',
                },
            });
            return memberships.map((membership) => ({
                id: membership.organization.id,
                name: membership.organization.name,
                description: membership.organization.description,
                role: membership.role,
                memberCount: membership.organization._count.members,
                joinedAt: membership.joinedAt,
                isActive: membership.organization.isActive,
            }));
        }
        catch (error) {
            this.logger.error('Error getting user organizations:', error);
            throw error;
        }
    }
    async getOrganizationWithMembers(organizationId) {
        try {
            const organization = await this.prisma.organization.findUnique({
                where: { id: organizationId },
                include: {
                    members: {
                        where: { isActive: true },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstName: true,
                                    lastName: true,
                                    username: true,
                                },
                            },
                        },
                    },
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
            if (!organization) {
                throw ErrorHandler_1.ErrorHandler.createError('Organization not found', 404);
            }
            return organization;
        }
        catch (error) {
            this.logger.error('Error getting organization with members:', error);
            throw error;
        }
    }
    async getMemberCount(organizationId) {
        try {
            return await this.prisma.organizationMember.count({
                where: {
                    organizationId,
                    isActive: true,
                },
            });
        }
        catch (error) {
            this.logger.error('Error getting member count:', error);
            throw error;
        }
    }
    async canInviteMore(organizationId) {
        const count = await this.getMemberCount(organizationId);
        return count < 3;
    }
    async getUserRole(organizationId, userId) {
        try {
            const member = await this.prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId,
                    },
                },
                select: {
                    role: true,
                    isActive: true,
                },
            });
            if (!member || !member.isActive) {
                return null;
            }
            return member.role;
        }
        catch (error) {
            this.logger.error('Error getting user role:', error);
            throw error;
        }
    }
    async hasAccess(organizationId, userId) {
        const role = await this.getUserRole(organizationId, userId);
        return role !== null;
    }
    async isOwner(organizationId, userId) {
        const role = await this.getUserRole(organizationId, userId);
        return role === client_1.MemberRole.OWNER;
    }
    async isOwnerOrAdmin(organizationId, userId) {
        const role = await this.getUserRole(organizationId, userId);
        return role === client_1.MemberRole.OWNER || role === client_1.MemberRole.ADMIN;
    }
    async addMember(organizationId, userId, role = client_1.MemberRole.MEMBER) {
        try {
            const canInvite = await this.canInviteMore(organizationId);
            if (!canInvite) {
                throw ErrorHandler_1.ErrorHandler.createError('Organization has reached maximum member limit (3 total)', 400);
            }
            const existingMember = await this.prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId,
                    },
                },
            });
            if (existingMember) {
                if (existingMember.isActive) {
                    throw ErrorHandler_1.ErrorHandler.createError('User is already a member of this organization', 409);
                }
                return await this.prisma.organizationMember.update({
                    where: {
                        organizationId_userId: {
                            organizationId,
                            userId,
                        },
                    },
                    data: {
                        isActive: true,
                        role,
                    },
                });
            }
            const member = await this.prisma.organizationMember.create({
                data: {
                    organizationId,
                    userId,
                    role,
                    isActive: true,
                },
            });
            this.logOperation('ADD_MEMBER', { organizationId, userId, role });
            return member;
        }
        catch (error) {
            this.logger.error('Error adding member:', error);
            throw error;
        }
    }
    async updateMemberRole(organizationId, userId, newRole) {
        try {
            const currentRole = await this.getUserRole(organizationId, userId);
            if (currentRole === client_1.MemberRole.OWNER && newRole !== client_1.MemberRole.OWNER) {
                throw ErrorHandler_1.ErrorHandler.createError('Cannot change owner role', 400);
            }
            const member = await this.prisma.organizationMember.update({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId,
                    },
                },
                data: {
                    role: newRole,
                },
            });
            this.logOperation('UPDATE_MEMBER_ROLE', { organizationId, userId, newRole });
            return member;
        }
        catch (error) {
            this.logger.error('Error updating member role:', error);
            throw error;
        }
    }
    async removeMember(organizationId, userId) {
        try {
            const role = await this.getUserRole(organizationId, userId);
            if (role === client_1.MemberRole.OWNER) {
                throw ErrorHandler_1.ErrorHandler.createError('Cannot remove owner from organization', 400);
            }
            await this.prisma.organizationMember.update({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId,
                    },
                },
                data: {
                    isActive: false,
                },
            });
            this.logOperation('REMOVE_MEMBER', { organizationId, userId });
        }
        catch (error) {
            this.logger.error('Error removing member:', error);
            throw error;
        }
    }
    async updateOrganization(organizationId, data) {
        try {
            const organization = await this.update(organizationId, data);
            this.logOperation('UPDATE', { id: organization.id, name: organization.name });
            return organization;
        }
        catch (error) {
            this.logger.error('Error updating organization:', error);
            throw error;
        }
    }
    async deleteOrganization(organizationId) {
        try {
            await this.update(organizationId, { isActive: false });
            this.logOperation('DELETE', { id: organizationId });
        }
        catch (error) {
            this.logger.error('Error deleting organization:', error);
            throw error;
        }
    }
}
exports.OrganizationModel = OrganizationModel;
//# sourceMappingURL=OrganizationModel.js.map