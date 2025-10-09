"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const InventoryController_1 = require("@/controllers/InventoryController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class InventoryRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.inventoryController = new InventoryController_1.InventoryController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', [
            (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
            (0, express_validator_1.query)('productId').optional().isString().withMessage('Product ID must be a string'),
            (0, express_validator_1.query)('type').optional().isIn(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']).withMessage('Invalid inventory type'),
        ], ValidationMiddleware_1.ValidationMiddleware.validatePagination, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.inventoryController.getInventory.bind(this.inventoryController));
        this.router.post('/', [
            (0, express_validator_1.body)('productId').isString().withMessage('Product ID is required'),
            (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
            (0, express_validator_1.body)('type').isIn(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']).withMessage('Invalid inventory type'),
            (0, express_validator_1.body)('reference').optional().isString().withMessage('Reference must be a string'),
            (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER', 'STAFF'), this.inventoryController.addInventory.bind(this.inventoryController));
        this.router.get('/product/:productId/stock', [
            (0, express_validator_1.param)('productId').isString().withMessage('Product ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.inventoryController.getProductStock.bind(this.inventoryController));
        this.router.get('/stats/overview', AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.inventoryController.getInventoryStats.bind(this.inventoryController));
    }
    getRouter() {
        return this.router;
    }
}
exports.InventoryRoutes = InventoryRoutes;
//# sourceMappingURL=InventoryRoutes.js.map