import { Invitation, InvitationStatus, MemberRole, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateInvitationData {
    organizationId: string;
    email: string;
    role: MemberRole;
    sentBy: string;
    expiresInDays?: number;
}
export declare class InvitationModel extends BaseModel<Invitation> {
    getTableName(): string;
    createInvitation(data: CreateInvitationData): Promise<Invitation>;
    getInvitationById(id: string): Promise<Invitation | null>;
    getInvitationByToken(token: string): Promise<Invitation | null>;
    verifyInvitationToken(token: string): Promise<Invitation>;
    acceptInvitation(token: string): Promise<Invitation>;
    updateInvitationStatus(id: string, status: InvitationStatus): Promise<Invitation>;
    cancelInvitation(id: string, userId: string): Promise<Invitation>;
    getInvitations(where?: Prisma.InvitationWhereInput, options?: Prisma.InvitationFindManyArgs): Promise<{
        data: Invitation[];
        total: number;
    }>;
    cleanupExpiredInvitations(): Promise<number>;
}
//# sourceMappingURL=InvitationModel.d.ts.map