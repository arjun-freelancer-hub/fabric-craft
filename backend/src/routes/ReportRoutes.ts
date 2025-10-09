import { Router } from 'express';
import { query } from 'express-validator';
import { ReportController } from '@/controllers/ReportController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class ReportRoutes {
    private router: Router;
    private reportController: ReportController;

    constructor() {
        this.router = Router();
        this.reportController = new ReportController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Sales report
        this.router.get(
            '/sales',
            [
                query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
                query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
                query('groupBy').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Group by must be day, week, month, or year'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.reportController.getSalesReport.bind(this.reportController)
        );

        // Inventory report
        this.router.get(
            '/inventory',
            [
                query('categoryId').optional().isString().withMessage('Category ID must be a string'),
                query('lowStock').optional().isBoolean().withMessage('Low stock must be a boolean'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.reportController.getInventoryReport.bind(this.reportController)
        );

        // Customer report
        this.router.get(
            '/customers',
            [
                query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
                query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
                query('topCustomers').optional().isInt({ min: 1, max: 100 }).withMessage('Top customers must be between 1 and 100'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.reportController.getCustomerReport.bind(this.reportController)
        );

        // Product performance report
        this.router.get(
            '/products/performance',
            [
                query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
                query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
                query('topProducts').optional().isInt({ min: 1, max: 100 }).withMessage('Top products must be between 1 and 100'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.reportController.getProductPerformanceReport.bind(this.reportController)
        );

        // Dashboard overview
        this.router.get(
            '/dashboard',
            [
                query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid date'),
                query('dateTo').optional().isISO8601().withMessage('Date to must be a valid date'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER'),
            this.reportController.getDashboardOverview.bind(this.reportController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
