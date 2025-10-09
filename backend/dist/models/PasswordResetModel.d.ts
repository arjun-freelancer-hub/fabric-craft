import { PasswordReset } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreatePasswordResetData {
    email: string;
    expiresInHours?: number;
}
export declare class PasswordResetModel extends BaseModel<PasswordReset> {
    getTableName(): string;
    createPasswordResetToken(data: CreatePasswordResetData): Promise<PasswordReset>;
    getPasswordResetByToken(token: string): Promise<PasswordReset | null>;
    verifyPasswordResetToken(token: string): Promise<PasswordReset>;
    markAsUsed(token: string): Promise<PasswordReset>;
    cleanupExpiredTokens(): Promise<number>;
}
//# sourceMappingURL=PasswordResetModel.d.ts.map