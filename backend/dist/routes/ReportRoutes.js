"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const ReportController_1 = require("@/controllers/ReportController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class ReportRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reportController = new ReportController_1.ReportController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/sales', [
            (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
            (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
            (0, express_validator_1.query)('groupBy').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Group by must be day, week, month, or year'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.reportController.getSalesReport.bind(this.reportController));
        this.router.get('/inventory', [
            (0, express_validator_1.query)('categoryId').optional().isString().withMessage('Category ID must be a string'),
            (0, express_validator_1.query)('lowStock').optional().isBoolean().withMessage('Low stock must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.reportController.getInventoryReport.bind(this.reportController));
        this.router.get('/customers', [
            (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
            (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
            (0, express_validator_1.query)('topCustomers').optional().isInt({ min: 1, max: 100 }).withMessage('Top customers must be between 1 and 100'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.reportController.getCustomerReport.bind(this.reportController));
        this.router.get('/products/performance', [
            (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
            (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
            (0, express_validator_1.query)('topProducts').optional().isInt({ min: 1, max: 100 }).withMessage('Top products must be between 1 and 100'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.reportController.getProductPerformanceReport.bind(this.reportController));
        this.router.get('/dashboard', [
            (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
            (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.reportController.getDashboardOverview.bind(this.reportController));
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportRoutes = ReportRoutes;
//# sourceMappingURL=ReportRoutes.js.map