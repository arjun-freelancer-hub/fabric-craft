"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const BillController_1 = require("@/controllers/BillController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class BillRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.billController = new BillController_1.BillController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', [
            (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
            (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
            (0, express_validator_1.query)('customerId').optional().isString().withMessage('Customer ID must be a string'),
            (0, express_validator_1.query)('status').optional().isIn(['DRAFT', 'ACTIVE', 'CANCELLED', 'RETURNED']).withMessage('Invalid bill status'),
            (0, express_validator_1.query)('paymentStatus').optional().isIn(['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
            (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
            (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
        ], ValidationMiddleware_1.ValidationMiddleware.validatePagination, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.billController.getBills.bind(this.billController));
        this.router.get('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.billController.getBillById.bind(this.billController));
        this.router.post('/', [
            (0, express_validator_1.body)('customerId').optional().isString().withMessage('Customer ID must be a string'),
            (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('At least one item is required'),
            (0, express_validator_1.body)('items.*.productId').optional().isString().withMessage('Product ID must be a string'),
            (0, express_validator_1.body)('items.*.customName').optional().isString().withMessage('Custom name must be a string'),
            (0, express_validator_1.body)('items.*.description').optional().isString().withMessage('Description must be a string'),
            (0, express_validator_1.body)('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number'),
            (0, express_validator_1.body)('items.*.unit').isString().withMessage('Unit is required'),
            (0, express_validator_1.body)('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
            (0, express_validator_1.body)('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Discount must be a non-negative number'),
            (0, express_validator_1.body)('items.*.isTailoring').optional().isBoolean().withMessage('isTailoring must be a boolean'),
            (0, express_validator_1.body)('items.*.tailoringPrice').optional().isFloat({ min: 0 }).withMessage('Tailoring price must be a positive number'),
            (0, express_validator_1.body)('items.*.measurements').optional().isObject().withMessage('Measurements must be an object'),
            (0, express_validator_1.body)('items.*.notes').optional().isString().withMessage('Notes must be a string'),
            (0, express_validator_1.body)('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a non-negative number'),
            (0, express_validator_1.body)('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a non-negative number'),
            (0, express_validator_1.body)('paymentMethod').isIn(['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'CHEQUE']).withMessage('Invalid payment method'),
            (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
            (0, express_validator_1.body)('deliveryDate').optional().isISO8601().withMessage('Delivery date must be a valid date'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.billController.createBill.bind(this.billController));
        this.router.put('/:id', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
            (0, express_validator_1.body)('customerId').optional().isString().withMessage('Customer ID must be a string'),
            (0, express_validator_1.body)('items').optional().isArray().withMessage('Items must be an array'),
            (0, express_validator_1.body)('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a non-negative number'),
            (0, express_validator_1.body)('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a non-negative number'),
            (0, express_validator_1.body)('paymentMethod').optional().isIn(['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'CHEQUE']).withMessage('Invalid payment method'),
            (0, express_validator_1.body)('paymentStatus').optional().isIn(['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
            (0, express_validator_1.body)('status').optional().isIn(['DRAFT', 'ACTIVE', 'CANCELLED', 'RETURNED']).withMessage('Invalid bill status'),
            (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
            (0, express_validator_1.body)('deliveryDate').optional().isISO8601().withMessage('Delivery date must be a valid date'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.billController.updateBill.bind(this.billController));
        this.router.post('/:id/cancel', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
            (0, express_validator_1.body)('reason').optional().isString().withMessage('Reason must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.billController.cancelBill.bind(this.billController));
        this.router.get('/:id/invoice', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
            (0, express_validator_1.query)('format').optional().isIn(['pdf', 'html']).withMessage('Format must be pdf or html'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.billController.generateInvoice.bind(this.billController));
        this.router.post('/:id/send-whatsapp', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
            (0, express_validator_1.body)('phoneNumber').isString().withMessage('Phone number is required'),
            (0, express_validator_1.body)('message').optional().isString().withMessage('Message must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.billController.sendInvoiceWhatsApp.bind(this.billController));
        this.router.post('/:id/payments', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
            (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
            (0, express_validator_1.body)('method').isIn(['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'CHEQUE']).withMessage('Invalid payment method'),
            (0, express_validator_1.body)('reference').optional().isString().withMessage('Reference must be a string'),
            (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.billController.addPayment.bind(this.billController));
        this.router.get('/:id/payments', [
            (0, express_validator_1.param)('id').isString().withMessage('Bill ID is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, this.billController.getBillPayments.bind(this.billController));
        this.router.get('/stats/overview', [
            (0, express_validator_1.query)('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
            (0, express_validator_1.query)('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.billController.getBillStats.bind(this.billController));
        this.router.get('/reports/daily-sales', [
            (0, express_validator_1.query)('date').optional().isISO8601().withMessage('Date must be a valid date'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER'), this.billController.getDailySalesReport.bind(this.billController));
    }
    getRouter() {
        return this.router;
    }
}
exports.BillRoutes = BillRoutes;
//# sourceMappingURL=BillRoutes.js.map