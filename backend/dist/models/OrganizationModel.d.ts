import { Organization, OrganizationMember, MemberRole } from '@prisma/client';
import { BaseModel } from './BaseModel';
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
export declare class OrganizationModel extends BaseModel<Organization> {
    getTableName(): string;
    createOrganization(data: CreateOrganizationData): Promise<Organization>;
    getUserOrganizations(userId: string): Promise<any[]>;
    getOrganizationWithMembers(organizationId: string): Promise<any>;
    getMemberCount(organizationId: string): Promise<number>;
    canInviteMore(organizationId: string): Promise<boolean>;
    getUserRole(organizationId: string, userId: string): Promise<MemberRole | null>;
    hasAccess(organizationId: string, userId: string): Promise<boolean>;
    isOwner(organizationId: string, userId: string): Promise<boolean>;
    isOwnerOrAdmin(organizationId: string, userId: string): Promise<boolean>;
    addMember(organizationId: string, userId: string, role?: MemberRole): Promise<OrganizationMember>;
    updateMemberRole(organizationId: string, userId: string, newRole: MemberRole): Promise<OrganizationMember>;
    removeMember(organizationId: string, userId: string): Promise<void>;
    updateOrganization(organizationId: string, data: {
        name?: string;
        description?: string;
    }): Promise<Organization>;
    deleteOrganization(organizationId: string): Promise<void>;
}
//# sourceMappingURL=OrganizationModel.d.ts.map