import bcrypt from 'bcryptjs';
import { User, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

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

export class UserModel extends BaseModel<User> {
    getTableName(): string {
        return 'user';
    }

    public async createUser(data: CreateUserData): Promise<User> {
        try {
            // Check if user already exists
            const existingUser = await this.findByEmailOrUsername(data.email, data.username);
            if (existingUser) {
                throw ErrorHandler.createError('User with this email or username already exists', 409);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const userData = {
                ...data,
                password: hashedPassword,
            };

            const user = await this.create(userData);
            this.logOperation('CREATE', { id: user.id, email: user.email });
            return user;
        } catch (error) {
            this.logger.error('Error creating user:', error);
            throw error;
        }
    }

    public async updateUser(id: string, data: UpdateUserData): Promise<User> {
        try {
            // Check if email or username is being changed and if it already exists
            if (data.email || data.username) {
                const existingUser = await this.findByEmailOrUsername(data.email, data.username);
                if (existingUser && existingUser.id !== id) {
                    throw ErrorHandler.createError('User with this email or username already exists', 409);
                }
            }

            const user = await this.update(id, data);
            this.logOperation('UPDATE', { id: user.id, email: user.email });
            return user;
        } catch (error) {
            this.logger.error('Error updating user:', error);
            throw error;
        }
    }

    public async changePassword(id: string, data: ChangePasswordData): Promise<void> {
        try {
            const user = await this.findById(id);
            if (!user) {
                throw ErrorHandler.createError('User not found', 404);
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw ErrorHandler.createError('Current password is incorrect', 400);
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

            await this.update(id, { password: hashedNewPassword });
            this.logOperation('PASSWORD_CHANGE', { id: user.id });
        } catch (error) {
            this.logger.error('Error changing password:', error);
            throw error;
        }
    }

    public async findByEmailOrUsername(email?: string, username?: string): Promise<User | null> {
        try {
            if (!email && !username) {
                return null;
            }

            const where: Prisma.UserWhereInput = {
                OR: [],
            };

            if (email) {
                where.OR!.push({ email });
            }

            if (username) {
                where.OR!.push({ username });
            }

            const user = await this.prisma.user.findFirst({ where });
            return user;
        } catch (error) {
            this.logger.error('Error finding user by email or username:', error);
            throw error;
        }
    }

    public async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            return user;
        } catch (error) {
            this.logger.error('Error finding user by email:', error);
            throw error;
        }
    }

    public async findByUsername(username: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username },
            });
            return user;
        } catch (error) {
            this.logger.error('Error finding user by username:', error);
            throw error;
        }
    }

    public async verifyPassword(user: User, password: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            this.logger.error('Error verifying password:', error);
            throw error;
        }
    }

    public async getActiveUsers(): Promise<Partial<User>[]> {
        try {
            const users = await this.prisma.user.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return users;
        } catch (error) {
            this.logger.error('Error getting active users:', error);
            throw error;
        }
    }

    public async getUserStats(): Promise<{
        total: number;
        active: number;
    }> {
        try {
            const [total, active] = await Promise.all([
                this.count(),
                this.count({ isActive: true }),
            ]);

            return {
                total,
                active,
            };
        } catch (error) {
            this.logger.error('Error getting user stats:', error);
            throw error;
        }
    }

    public async searchUsers(query: string, limit: number = 10): Promise<Partial<User>[]> {
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    AND: [
                        { isActive: true },
                        {
                            OR: [
                                { firstName: { contains: query } },
                                { lastName: { contains: query } },
                                { email: { contains: query } },
                                { username: { contains: query } },
                            ],
                        },
                    ],
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
                take: limit,
                orderBy: { firstName: 'asc' },
            });

            return users;
        } catch (error) {
            this.logger.error('Error searching users:', error);
            throw error;
        }
    }
}
