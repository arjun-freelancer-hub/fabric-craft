"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class UserModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'user';
    }
    async createUser(data) {
        try {
            const existingUser = await this.findByEmailOrUsername(data.email, data.username);
            if (existingUser) {
                throw ErrorHandler_1.ErrorHandler.createError('User with this email or username already exists', 409);
            }
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const userData = {
                ...data,
                password: hashedPassword,
            };
            const user = await this.create(userData);
            this.logOperation('CREATE', { id: user.id, email: user.email });
            return user;
        }
        catch (error) {
            this.logger.error('Error creating user:', error);
            throw error;
        }
    }
    async updateUser(id, data) {
        try {
            if (data.email || data.username) {
                const existingUser = await this.findByEmailOrUsername(data.email, data.username);
                if (existingUser && existingUser.id !== id) {
                    throw ErrorHandler_1.ErrorHandler.createError('User with this email or username already exists', 409);
                }
            }
            const user = await this.update(id, data);
            this.logOperation('UPDATE', { id: user.id, email: user.email });
            return user;
        }
        catch (error) {
            this.logger.error('Error updating user:', error);
            throw error;
        }
    }
    async changePassword(id, data) {
        try {
            const user = await this.findById(id);
            if (!user) {
                throw ErrorHandler_1.ErrorHandler.createError('User not found', 404);
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(data.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw ErrorHandler_1.ErrorHandler.createError('Current password is incorrect', 400);
            }
            const hashedNewPassword = await bcryptjs_1.default.hash(data.newPassword, 10);
            await this.update(id, { password: hashedNewPassword });
            this.logOperation('PASSWORD_CHANGE', { id: user.id });
        }
        catch (error) {
            this.logger.error('Error changing password:', error);
            throw error;
        }
    }
    async findByEmailOrUsername(email, username) {
        try {
            if (!email && !username) {
                return null;
            }
            const where = {
                OR: [],
            };
            if (email) {
                where.OR.push({ email });
            }
            if (username) {
                where.OR.push({ username });
            }
            const user = await this.prisma.user.findFirst({ where });
            return user;
        }
        catch (error) {
            this.logger.error('Error finding user by email or username:', error);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            return user;
        }
        catch (error) {
            this.logger.error('Error finding user by email:', error);
            throw error;
        }
    }
    async findByUsername(username) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username },
            });
            return user;
        }
        catch (error) {
            this.logger.error('Error finding user by username:', error);
            throw error;
        }
    }
    async verifyPassword(user, password) {
        try {
            return await bcryptjs_1.default.compare(password, user.password);
        }
        catch (error) {
            this.logger.error('Error verifying password:', error);
            throw error;
        }
    }
    async getActiveUsers() {
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
        }
        catch (error) {
            this.logger.error('Error getting active users:', error);
            throw error;
        }
    }
    async getUserStats() {
        try {
            const [total, active] = await Promise.all([
                this.count(),
                this.count({ isActive: true }),
            ]);
            return {
                total,
                active,
            };
        }
        catch (error) {
            this.logger.error('Error getting user stats:', error);
            throw error;
        }
    }
    async searchUsers(query, limit = 10) {
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
        }
        catch (error) {
            this.logger.error('Error searching users:', error);
            throw error;
        }
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=UserModel.js.map