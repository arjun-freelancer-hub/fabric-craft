"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = void 0;
const BaseModel_1 = require("./BaseModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
class CategoryModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'category';
    }
    async createCategory(data) {
        try {
            const existingCategory = await this.findByName(undefined, data.name);
            if (existingCategory) {
                throw ErrorHandler_1.ErrorHandler.createError('Category with this name already exists', 409);
            }
            const category = await this.create(data);
            this.logOperation('CREATE', { id: category.id, name: category.name });
            return category;
        }
        catch (error) {
            this.logger.error('Error creating category:', error);
            throw error;
        }
    }
    async updateCategory(id, data) {
        try {
            if (data.name) {
                const existingCategory = await this.findByName(undefined, data.name);
                if (existingCategory && existingCategory.id !== id) {
                    throw ErrorHandler_1.ErrorHandler.createError('Category with this name already exists', 409);
                }
            }
            const category = await this.update(id, data);
            this.logOperation('UPDATE', { id: category.id, name: category.name });
            return category;
        }
        catch (error) {
            this.logger.error('Error updating category:', error);
            throw error;
        }
    }
    async findByName(organizationId, name) {
        try {
            if (!organizationId) {
                const category = await this.prisma.category.findFirst({
                    where: { name },
                });
                return category;
            }
            const category = await this.prisma.category.findUnique({
                where: {
                    organizationId_name: {
                        organizationId,
                        name,
                    },
                },
            });
            return category;
        }
        catch (error) {
            this.logger.error('Error finding category by name:', error);
            throw error;
        }
    }
    async getActiveCategories() {
        try {
            const categories = await this.prisma.category.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
            return categories;
        }
        catch (error) {
            this.logger.error('Error getting active categories:', error);
            throw error;
        }
    }
    async getCategoryStats() {
        try {
            const [total, active, withProducts] = await Promise.all([
                this.count(),
                this.count({ isActive: true }),
                this.prisma.category.count({
                    where: {
                        isActive: true,
                        products: {
                            some: {
                                isActive: true,
                            },
                        },
                    },
                }),
            ]);
            return {
                total,
                active,
                withProducts,
            };
        }
        catch (error) {
            this.logger.error('Error getting category stats:', error);
            throw error;
        }
    }
}
exports.CategoryModel = CategoryModel;
//# sourceMappingURL=CategoryModel.js.map