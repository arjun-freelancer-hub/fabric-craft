import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { InventoryController } from '@/controllers/InventoryController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class InventoryRoutes {
  private router: Router;
  private inventoryController: InventoryController;

  constructor() {
    this.router = Router();
    this.inventoryController = new InventoryController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get inventory with pagination
    this.router.get(
      '/',
      [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('productId').optional().isString().withMessage('Product ID must be a string'),
        query('type').optional().isIn(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']).withMessage('Invalid inventory type'),
      ],
      ValidationMiddleware.validatePagination,
      ValidationMiddleware.sanitizeInput,
      this.inventoryController.getInventory.bind(this.inventoryController)
    );

    // Add inventory (stock in)
    this.router.post(
      '/',
      [
        body('productId').isString().withMessage('Product ID is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('type').isIn(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']).withMessage('Invalid inventory type'),
        body('reference').optional().isString().withMessage('Reference must be a string'),
        body('notes').optional().isString().withMessage('Notes must be a string'),
      ],
      ValidationMiddleware.validate,
      ValidationMiddleware.sanitizeInput,
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize('ADMIN', 'OWNER', 'STAFF'),
      this.inventoryController.addInventory.bind(this.inventoryController)
    );

    // Get product stock
    this.router.get(
      '/product/:productId/stock',
      [
        param('productId').isString().withMessage('Product ID is required'),
      ],
      ValidationMiddleware.validate,
      this.inventoryController.getProductStock.bind(this.inventoryController)
    );

    // Get inventory statistics
    this.router.get(
      '/stats/overview',
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize('ADMIN', 'OWNER'),
      this.inventoryController.getInventoryStats.bind(this.inventoryController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
