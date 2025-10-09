"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CategoryModel_1 = require("@/models/CategoryModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
class CategoryController {
    constructor() {
        this.categoryModel = new CategoryModel_1.CategoryModel();
        this.logger = new Logger_1.Logger();
    }
    async getCategories(req, res, next) {
        try {
            const categories = await this.categoryModel.findMany({ isActive: true });
            res.status(200).json({
                success: true,
                data: { categories: categories.data },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await this.categoryModel.findById(id);
            if (!category) {
                throw ErrorHandler_1.ErrorHandler.createError('Category not found', 404);
            }
            res.status(200).json({
                success: true,
                data: { category },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createCategory(req, res, next) {
        try {
            const category = await this.categoryModel.createCategory(req.body);
            this.logger.info('Category created successfully', {
                categoryId: category.id,
                name: category.name,
                createdBy: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { category },
                message: 'Category created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await this.categoryModel.updateCategory(id, req.body);
            this.logger.info('Category updated successfully', {
                categoryId: category.id,
                name: category.name,
                updatedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { category },
                message: 'Category updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await this.categoryModel.softDelete(id);
            this.logger.info('Category deleted successfully', {
                categoryId: category.id,
                name: category.name,
                deletedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map