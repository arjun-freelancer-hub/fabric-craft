import { Router } from 'express';
import { body, param } from 'express-validator';
import { SettingController } from '@/controllers/SettingController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class SettingRoutes {
    private router: Router;
    private settingController: SettingController;

    constructor() {
        this.router = Router();
        this.settingController = new SettingController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Get WhatsApp settings
        this.router.get(
            '/whatsapp',
            AuthMiddleware.authenticate,
            this.settingController.getWhatsAppSettings.bind(this.settingController)
        );

        // Update WhatsApp settings
        this.router.put(
            '/whatsapp',
            [
                body('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
                body('method').optional().isIn(['web', 'api']).withMessage('Method must be web or api'),
                body('apiUrl').optional().isString().withMessage('API URL must be a string'),
                body('accessToken').optional().isString().withMessage('Access token must be a string'),
                body('phoneNumberId').optional().isString().withMessage('Phone number ID must be a string'),
                body('businessAccountId').optional().isString().withMessage('Business account ID must be a string'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            this.settingController.updateWhatsAppSettings.bind(this.settingController)
        );

        // Test WhatsApp connection
        this.router.post(
            '/whatsapp/test',
            AuthMiddleware.authenticate,
            this.settingController.testWhatsAppConnection.bind(this.settingController)
        );

        // Get business settings
        this.router.get(
            '/business/info',
            AuthMiddleware.authenticate,
            this.settingController.getBusinessSettings.bind(this.settingController)
        );

        // Update business settings
        this.router.put(
            '/business/info',
            AuthMiddleware.authenticate,
            this.settingController.updateBusinessSettings.bind(this.settingController)
        );

        // Upload logo
        this.router.post(
            '/business/logo',
            [
                body('logo').isString().withMessage('Logo data is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.settingController.uploadLogo.bind(this.settingController)
        );

        // Generate sample invoice
        this.router.post(
            '/business/generate-sample-invoice',
            [
                body('billData').isObject().withMessage('Bill data is required'),
                body('template').isIn(['modern', 'classic', 'minimal', 'elegant']).withMessage('Template must be one of: modern, classic, minimal, elegant'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.settingController.generateSampleInvoice.bind(this.settingController)
        );

        // Get settings by category
        this.router.get(
            '/:category',
            [
                param('category').isString().withMessage('Category is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.settingController.getSettingsByCategory.bind(this.settingController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}

