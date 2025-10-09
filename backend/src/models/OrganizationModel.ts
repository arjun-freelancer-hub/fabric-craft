import { Organization, OrganizationMember, MemberRole } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface CreateOrganizationData {
    name: string;
    description?: string;
    ownerId: string;
}

export interface OrganizationWithMembers extends Organization {
    members: OrganizationMember[];
    _count?: {
        members: number;
    };
}

export class OrganizationModel extends BaseModel<Organization> {
    getTableName(): string {
        return 'organization';
    }

    /**
     * Create a new organization and add owner as member
     */
    public async createOrganization(data: CreateOrganizationData): Promise<Organization> {
        try {
            const organization = await this.prisma.organization.create({
                data: {
                    name: data.name,
                    description: data.description,
                    ownerId: data.ownerId,
                    members: {
                        create: {
                            userId: data.ownerId,
                            role: MemberRole.OWNER,
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
        } catch (error) {
            this.logger.error('Error creating organization:', error);
            throw error;
        }
    }

    /**
     * Get all organizations a user belongs to
     */
    public async getUserOrganizations(userId: string): Promise<any[]> {
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
        } catch (error) {
            this.logger.error('Error getting user organizations:', error);
            throw error;
        }
    }

    /**
     * Get organization by ID with members
     */
    public async getOrganizationWithMembers(organizationId: string): Promise<any> {
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
                throw ErrorHandler.createError('Organization not found', 404);
            }

            return organization;
        } catch (error) {
            this.logger.error('Error getting organization with members:', error);
            throw error;
        }
    }

    /**
     * Get member count for an organization
     */
    public async getMemberCount(organizationId: string): Promise<number> {
        try {
            return await this.prisma.organizationMember.count({
                where: {
                    organizationId,
                    isActive: true,
                },
            });
        } catch (error) {
            this.logger.error('Error getting member count:', error);
            throw error;
        }
    }

    /**
     * Check if organization can invite more members (max 2 members + 1 owner = 3 total)
     */
    public async canInviteMore(organizationId: string): Promise<boolean> {
        const count = await this.getMemberCount(organizationId);
        return count < 3;
    }

    /**
     * Get user's role in organization
     */
    public async getUserRole(
        organizationId: string,
        userId: string
    ): Promise<MemberRole | null> {
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
        } catch (error) {
            this.logger.error('Error getting user role:', error);
            throw error;
        }
    }

    /**
     * Check if user has access to organization
     */
    public async hasAccess(organizationId: string, userId: string): Promise<boolean> {
        const role = await this.getUserRole(organizationId, userId);
        return role !== null;
    }

    /**
     * Check if user is owner of organization
     */
    public async isOwner(organizationId: string, userId: string): Promise<boolean> {
        const role = await this.getUserRole(organizationId, userId);
        return role === MemberRole.OWNER;
    }

    /**
     * Check if user is owner or admin
     */
    public async isOwnerOrAdmin(organizationId: string, userId: string): Promise<boolean> {
        const role = await this.getUserRole(organizationId, userId);
        return role === MemberRole.OWNER || role === MemberRole.ADMIN;
    }

    /**
     * Add member to organization
     */
    public async addMember(
        organizationId: string,
        userId: string,
        role: MemberRole = MemberRole.MEMBER
    ): Promise<OrganizationMember> {
        try {
            // Check if can invite more
            const canInvite = await this.canInviteMore(organizationId);
            if (!canInvite) {
                throw ErrorHandler.createError(
                    'Organization has reached maximum member limit (3 total)',
                    400
                );
            }

            // Check if user is already a member
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
                    throw ErrorHandler.createError('User is already a member of this organization', 409);
                }

                // Reactivate inactive member
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
        } catch (error) {
            this.logger.error('Error adding member:', error);
            throw error;
        }
    }

    /**
     * Update member role
     */
    public async updateMemberRole(
        organizationId: string,
        userId: string,
        newRole: MemberRole
    ): Promise<OrganizationMember> {
        try {
            // Can't change owner role
            const currentRole = await this.getUserRole(organizationId, userId);
            if (currentRole === MemberRole.OWNER && newRole !== MemberRole.OWNER) {
                throw ErrorHandler.createError('Cannot change owner role', 400);
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
        } catch (error) {
            this.logger.error('Error updating member role:', error);
            throw error;
        }
    }

    /**
     * Remove member from organization (soft delete)
     */
    public async removeMember(organizationId: string, userId: string): Promise<void> {
        try {
            // Can't remove owner
            const role = await this.getUserRole(organizationId, userId);
            if (role === MemberRole.OWNER) {
                throw ErrorHandler.createError('Cannot remove owner from organization', 400);
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
        } catch (error) {
            this.logger.error('Error removing member:', error);
            throw error;
        }
    }

    /**
     * Update organization details
     */
    public async updateOrganization(
        organizationId: string,
        data: { name?: string; description?: string }
    ): Promise<Organization> {
        try {
            const organization = await this.update(organizationId, data);
            this.logOperation('UPDATE', { id: organization.id, name: organization.name });
            return organization;
        } catch (error) {
            this.logger.error('Error updating organization:', error);
            throw error;
        }
    }

    /**
     * Delete organization (soft delete)
     */
    public async deleteOrganization(organizationId: string): Promise<void> {
        try {
            await this.update(organizationId, { isActive: false });
            this.logOperation('DELETE', { id: organizationId });
        } catch (error) {
            this.logger.error('Error deleting organization:', error);
            throw error;
        }
    }
}

