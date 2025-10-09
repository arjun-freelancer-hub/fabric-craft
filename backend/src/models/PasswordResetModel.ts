import crypto from 'crypto';
import { PasswordReset } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface CreatePasswordResetData {
    email: string;
    expiresInHours?: number;
}

export class PasswordResetModel extends BaseModel<PasswordReset> {
    getTableName(): string {
        return 'passwordReset';
    }

    /**
     * Create a password reset token
     */
    public async createPasswordResetToken(data: CreatePasswordResetData): Promise<PasswordReset> {
        try {
            // Check if user exists
            const user = await this.prisma.user.findUnique({
                where: { email: data.email },
            });

            if (!user) {
                // Don't reveal if user exists or not for security reasons
                throw ErrorHandler.createError('If the email exists, a reset link will be sent', 200);
            }

            if (!user.isActive) {
                throw ErrorHandler.createError('Account is deactivated', 401);
            }

            // Invalidate any existing unused tokens for this email
            await this.prisma.passwordReset.updateMany({
                where: {
                    email: data.email,
                    used: false,
                },
                data: {
                    used: true,
                },
            });

            // Generate unique token
            const token = crypto.randomBytes(32).toString('hex');

            // Set expiration (default 1 hour)
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
        } catch (error) {
            this.logger.error('Error creating password reset token:', error);
            throw error;
        }
    }

    /**
     * Get password reset by token
     */
    public async getPasswordResetByToken(token: string): Promise<PasswordReset | null> {
        try {
            const passwordReset = await this.prisma.passwordReset.findUnique({
                where: { token },
            });

            return passwordReset;
        } catch (error) {
            this.logger.error('Error finding password reset by token:', error);
            throw error;
        }
    }

    /**
     * Verify password reset token is valid
     */
    public async verifyPasswordResetToken(token: string): Promise<PasswordReset> {
        const passwordReset = await this.getPasswordResetByToken(token);

        if (!passwordReset) {
            throw ErrorHandler.createError('Invalid password reset token', 404);
        }

        if (passwordReset.used) {
            throw ErrorHandler.createError('Password reset token has already been used', 400);
        }

        if (new Date() > passwordReset.expiresAt) {
            throw ErrorHandler.createError('Password reset token has expired', 400);
        }

        return passwordReset;
    }

    /**
     * Mark password reset token as used
     */
    public async markAsUsed(token: string): Promise<PasswordReset> {
        try {
            const passwordReset = await this.prisma.passwordReset.update({
                where: { token },
                data: { used: true },
            });

            this.logOperation('MARK_USED', { id: passwordReset.id, email: passwordReset.email });
            return passwordReset;
        } catch (error) {
            this.logger.error('Error marking password reset as used:', error);
            throw error;
        }
    }

    /**
     * Clean up expired password reset tokens
     */
    public async cleanupExpiredTokens(): Promise<number> {
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
        } catch (error) {
            this.logger.error('Error cleaning up expired password reset tokens:', error);
            throw error;
        }
    }
}

