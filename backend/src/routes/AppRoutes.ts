import { Router } from 'express';
import { AuthRoutes } from './AuthRoutes';
import { WorkspaceRoutes } from './WorkspaceRoutes';
import { ProductRoutes } from './ProductRoutes';
import { CustomerRoutes } from './CustomerRoutes';
import { BillRoutes } from './BillRoutes';
import { InventoryRoutes } from './InventoryRoutes';
import { CategoryRoutes } from './CategoryRoutes';
import { UserRoutes } from './UserRoutes';
import { BarcodeRoutes } from './BarcodeRoutes';
import { ReportRoutes } from './ReportRoutes';
import { SettingRoutes } from './SettingRoutes';

export class AppRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Health check route
    this.router.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // Initialize all route modules
    this.router.use('/auth', new AuthRoutes().getRouter());
    this.router.use('/workspaces', new WorkspaceRoutes().getRouter());
    this.router.use('/products', new ProductRoutes().getRouter());
    this.router.use('/customers', new CustomerRoutes().getRouter());
    this.router.use('/bills', new BillRoutes().getRouter());
    this.router.use('/inventory', new InventoryRoutes().getRouter());
    this.router.use('/categories', new CategoryRoutes().getRouter());
    this.router.use('/users', new UserRoutes().getRouter());
    this.router.use('/barcodes', new BarcodeRoutes().getRouter());
    this.router.use('/reports', new ReportRoutes().getRouter());
    this.router.use('/settings', new SettingRoutes().getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
