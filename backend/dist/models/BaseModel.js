"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const DatabaseService_1 = require("@/services/DatabaseService");
const Logger_1 = require("@/utils/Logger");
class BaseModel {
    constructor() {
        this.databaseService = DatabaseService_1.DatabaseService.getInstance();
        this.logger = new Logger_1.Logger();
    }
    get prisma() {
        return this.databaseService.getClient();
    }
    async findById(id) {
        try {
            const result = await this.prisma[this.getTableName()].findUnique({
                where: { id },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error finding ${this.getTableName()} by ID:`, error);
            throw error;
        }
    }
    async findMany(where = {}, options = {}) {
        try {
            const [data, total] = await Promise.all([
                this.prisma[this.getTableName()].findMany({
                    where,
                    ...options,
                }),
                this.prisma[this.getTableName()].count({ where }),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error(`Error finding ${this.getTableName()} records:`, error);
            throw error;
        }
    }
    async create(data) {
        try {
            const result = await this.prisma[this.getTableName()].create({
                data,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error creating ${this.getTableName()}:`, error);
            throw error;
        }
    }
    async update(id, data) {
        try {
            const result = await this.prisma[this.getTableName()].update({
                where: { id },
                data,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error updating ${this.getTableName()}:`, error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const result = await this.prisma[this.getTableName()].delete({
                where: { id },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting ${this.getTableName()}:`, error);
            throw error;
        }
    }
    async softDelete(id) {
        try {
            const result = await this.prisma[this.getTableName()].update({
                where: { id },
                data: { isActive: false },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error soft deleting ${this.getTableName()}:`, error);
            throw error;
        }
    }
    async exists(id) {
        try {
            const count = await this.prisma[this.getTableName()].count({
                where: { id },
            });
            return count > 0;
        }
        catch (error) {
            this.logger.error(`Error checking ${this.getTableName()} existence:`, error);
            throw error;
        }
    }
    async count(where = {}) {
        try {
            return await this.prisma[this.getTableName()].count({ where });
        }
        catch (error) {
            this.logger.error(`Error counting ${this.getTableName()}:`, error);
            throw error;
        }
    }
    async executeTransaction(fn) {
        return await this.prisma.$transaction(fn);
    }
    logOperation(operation, data) {
        this.logger.info(`${this.getTableName()} ${operation}:`, {
            operation,
            data: typeof data === 'object' ? JSON.stringify(data) : data,
        });
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map