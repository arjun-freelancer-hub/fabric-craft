"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetModel = void 0;
const crypto_1 = __importDefault(require("crypto"));
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class PasswordResetModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'passwordReset';
    }
    async createPasswordResetToken(data) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (!user) {
                throw ErrorHandler_1.ErrorHandler.createError('If the email exists, a reset link will be sent', 200);
            }
            if (!user.isActive) {
                throw ErrorHandler_1.ErrorHandler.createError('Account is deactivated', 401);
            }
            await this.prisma.passwordReset.updateMany({
                where: {
                    email: data.email,
                    used: false,
                },
                data: {
                    used: true,
                },
            });
            const token = crypto_1.default.randomBytes(32).toString('hex');
            const expiresInHours = data.expiresInHours || 1;
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + expiresInHours);
            const passwordReset = await this.prisma.passwordReset.create({
                data: {
                    email: data.email,
                    token,
                    expiresAt,
                    used: false,
                },
            });
            this.logOperation('CREATE', { id: passwordReset.id, email: passwordReset.email });
            return passwordReset;
        }
        catch (error) {
            this.logger.error('Error creating password reset token:', error);
            throw error;
        }
    }
    async getPasswordResetByToken(token) {
        try {
            const passwordReset = await this.prisma.passwordReset.findUnique({
                where: { token },
            });
            return passwordReset;
        }
        catch (error) {
            this.logger.error('Error finding password reset by token:', error);
            throw error;
        }
    }
    async verifyPasswordResetToken(token) {
        const passwordReset = await this.getPasswordResetByToken(token);
        if (!passwordReset) {
            throw ErrorHandler_1.ErrorHandler.createError('Invalid password reset token', 404);
        }
        if (passwordReset.used) {
            throw ErrorHandler_1.ErrorHandler.createError('Password reset token has already been used', 400);
        }
        if (new Date() > passwordReset.expiresAt) {
            throw ErrorHandler_1.ErrorHandler.createError('Password reset token has expired', 400);
        }
        return passwordReset;
    }
    async markAsUsed(token) {
        try {
            const passwordReset = await this.prisma.passwordReset.update({
                where: { token },
                data: { used: true },
            });
            this.logOperation('MARK_USED', { id: passwordReset.id, email: passwordReset.email });
            return passwordReset;
        }
        catch (error) {
            this.logger.error('Error marking password reset as used:', error);
            throw error;
        }
    }
    async cleanupExpiredTokens() {
        try {
            const result = await this.prisma.passwordReset.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { used: true },
                    ],
                },
            });
            this.logger.info(`Deleted ${result.count} expired/used password reset tokens`);
            return result.count;
        }
        catch (error) {
            this.logger.error('Error cleaning up expired password reset tokens:', error);
            throw error;
        }
    }
}
exports.PasswordResetModel = PasswordResetModel;
//# sourceMappingURL=PasswordResetModel.js.map