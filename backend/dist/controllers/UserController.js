"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserModel_1 = require("@/models/UserModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
class UserController {
    constructor() {
        this.userModel = new UserModel_1.UserModel();
        this.logger = new Logger_1.Logger();
    }
    async getUsers(req, res, next) {
        try {
            const { search, role, isActive } = req.query;
            const pagination = req.pagination;
            let where = {};
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (role) {
                where.role = role;
            }
            if (isActive !== undefined) {
                where.isActive = isActive === 'true';
            }
            const { data, total } = await this.userModel.findMany(where, {
                skip: pagination.offset,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
            });
            res.status(200).json({
                success: true,
                data: {
                    users: data,
                    pagination: {
                        page: pagination.page,
                        limit: pagination.limit,
                        total,
                        pages: Math.ceil(total / pagination.limit),
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.userModel.findById(id);
            if (!user) {
                throw ErrorHandler_1.ErrorHandler.createError('User not found', 404);
            }
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({
                success: true,
                data: { user: userWithoutPassword },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createUser(req, res, next) {
        try {
            const user = await this.userModel.createUser(req.body);
            this.logger.info('User created successfully', {
                userId: user.id,
                email: user.email,
                createdBy: req.user.id,
            });
            const { password, ...userWithoutPassword } = user;
            res.status(201).json({
                success: true,
                data: { user: userWithoutPassword },
                message: 'User created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.userModel.updateUser(id, req.body);
            this.logger.info('User updated successfully', {
                userId: user.id,
                email: user.email,
                updatedBy: req.user.id,
            });
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({
                success: true,
                data: { user: userWithoutPassword },
                message: 'User updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.userModel.softDelete(id);
            this.logger.info('User deleted successfully', {
                userId: user.id,
                email: user.email,
                deletedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async searchUsers(req, res, next) {
        try {
            const { query } = req.params;
            const { limit = 20 } = req.query;
            const users = await this.userModel.searchUsers(query, parseInt(limit));
            res.status(200).json({
                success: true,
                data: { users },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserStats(req, res, next) {
        try {
            const stats = await this.userModel.getUserStats();
            res.status(200).json({
                success: true,
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map