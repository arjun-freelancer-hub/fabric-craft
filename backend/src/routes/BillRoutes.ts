import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { BillController } from '@/controllers/BillController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class BillRoutes {
    private router: Router;
    private billController: BillController;

    constructor() {
        this.router = Router();
        this.billController = new BillController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get all bills with pagination
        this.router.get(
            '/',
            [
                query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
                query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
                query('customerId').optional().isString().withMessage('Customer ID must be a string'),
                query('status').optional().isIn(['DRAFT', 'ACTIVE', 'CANCELLED', 'RETURNED']).withMessage('Invalid bill status'),
                query('paymentStatus').optional().isIn(['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
                query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
                query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
            ],
            ValidationMiddleware.validatePagination,
            ValidationMiddleware.sanitizeInput,
            this.billController.getBills.bind(this.billController)
        );

        // Get bill by ID
        this.router.get(
            '/:id',
            [
                param('id').isString().withMessage('Bill ID is required'),
            ],
            ValidationMiddleware.validate,
            this.billController.getBillById.bind(this.billController)
        );

        // Create new bill
        this.router.post(
            '/',
            [
                body('customerId').optional().isString().withMessage('Customer ID must be a string'),
                body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
                body('items.*.productId').optional().isString().withMessage('Product ID must be a string'),
                body('items.*.customName').optional().isString().withMessage('Custom name must be a string'),
                body('items.*.description').optional().isString().withMessage('Description must be a string'),
                body('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number'),
                body('items.*.unit').isString().withMessage('Unit is required'),
                body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
                body('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Discount must be a non-negative number'),
                body('items.*.isTailoring').optional().isBoolean().withMessage('isTailoring must be a boolean'),
                body('items.*.tailoringPrice').optional().isFloat({ min: 0 }).withMessage('Tailoring price must be a positive number'),
                body('items.*.measurements').optional().isObject().withMessage('Measurements must be an object'),
                body('items.*.notes').optional().isString().withMessage('Notes must be a string'),
                body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a non-negative number'),
                body('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a non-negative number'),
                body('paymentMethod').isIn(['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'CHEQUE']).withMessage('Invalid payment method'),
                body('notes').optional().isString().withMessage('Notes must be a string'),
                body('deliveryDate').optional().isISO8601().withMessage('Delivery date must be a valid date'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.billController.createBill.bind(this.billController)
        );

        // Update bill
        this.router.put(
            '/:id',
            [
                param('id').isString().withMessage('Bill ID is required'),
                body('customerId').optional().isString().withMessage('Customer ID must be a string'),
                body('items').optional().isArray().withMessage('Items must be an array'),
                body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a non-negative number'),
                body('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a non-negative number'),
                body('paymentMethod').optional().isIn(['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'CHEQUE']).withMessage('Invalid payment method'),
                body('paymentStatus').optional().isIn(['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Invalid payment status'),
                body('status').optional().isIn(['DRAFT', 'ACTIVE', 'CANCELLED', 'RETURNED']).withMessage('Invalid bill status'),
                body('notes').optional().isString().withMessage('Notes must be a string'),
                body('deliveryDate').optional().isISO8601().withMessage('Delivery date must be a valid date'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.billController.updateBill.bind(this.billController)
        );

        // Cancel bill
        this.router.post(
            '/:id/cancel',
            [
                param('id').isString().withMessage('Bill ID is required'),
                body('reason').optional().isString().withMessage('Reason must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.billController.cancelBill.bind(this.billController)
        );

        // Generate invoice PDF
        this.router.get(
            '/:id/invoice',
            [
                param('id').isString().withMessage('Bill ID is required'),
                query('format').optional().isIn(['pdf', 'html']).withMessage('Format must be pdf or html'),
            ],
            ValidationMiddleware.validate,
            this.billController.generateInvoice.bind(this.billController)
        );

        // Send invoice via WhatsApp
        this.router.post(
            '/:id/send-whatsapp',
            [
                param('id').isString().withMessage('Bill ID is required'),
                body('phoneNumber').isString().withMessage('Phone number is required'),
                body('message').optional().isString().withMessage('Message must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.billController.sendInvoiceWhatsApp.bind(this.billController)
        );

        // Add payment to bill
        this.router.post(
            '/:id/payments',
            [
                param('id').isString().withMessage('Bill ID is required'),
                body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
                body('method').isIn(['CASH', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'CHEQUE']).withMessage('Invalid payment method'),
                body('reference').optional().isString().withMessage('Reference must be a string'),
                body('notes').optional().isString().withMessage('Notes must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.billController.addPayment.bind(this.billController)
        );

        // Get bill payments
        this.router.get(
            '/:id/payments',
            [
                param('id').isString().withMessage('Bill ID is required'),
            ],
            ValidationMiddleware.validate,
            this.billController.getBillPayments.bind(this.billController)
        );

        // Get bill statistics
        this.router.get(
            '/stats/overview',
            [
                query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
                query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.billController.getBillStats.bind(this.billController)
        );

        // Get daily sales report
        this.router.get(
            '/reports/daily-sales',
            [
                query('date').optional().isISO8601().withMessage('Date must be a valid date'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.billController.getDailySalesReport.bind(this.billController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
