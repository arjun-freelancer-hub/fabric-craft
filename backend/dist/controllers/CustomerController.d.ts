import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
export declare class CustomerController {
    private customerModel;
    private logger;
    constructor();
    getCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    searchCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCustomerMeasurements(req: Request, res: Response, next: NextFunction): Promise<void>;
    addCustomerMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCustomerMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCustomerMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getCustomerBills(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCustomerStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=CustomerController.d.ts.map