import { User } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateUserData {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface UpdateUserData {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
}
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}
export declare class UserModel extends BaseModel<User> {
    getTableName(): string;
    createUser(data: CreateUserData): Promise<User>;
    updateUser(id: string, data: UpdateUserData): Promise<User>;
    changePassword(id: string, data: ChangePasswordData): Promise<void>;
    findByEmailOrUsername(email?: string, username?: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    verifyPassword(user: User, password: string): Promise<boolean>;
    getActiveUsers(): Promise<Partial<User>[]>;
    getUserStats(): Promise<{
        total: number;
        active: number;
    }>;
    searchUsers(query: string, limit?: number): Promise<Partial<User>[]>;
}
//# sourceMappingURL=UserModel.d.ts.map