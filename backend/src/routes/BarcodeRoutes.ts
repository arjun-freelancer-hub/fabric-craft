import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { BarcodeController } from '@/controllers/BarcodeController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class BarcodeRoutes {
    private router: Router;
    private barcodeController: BarcodeController;

    constructor() {
        this.router = Router();
        this.barcodeController = new BarcodeController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Generate barcode
        this.router.post(
            '/generate',
            [
                body('text').isString().withMessage('Text is required'),
                body('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
                body('width').optional().isInt({ min: 1, max: 10 }).withMessage('Width must be between 1 and 10'),
                body('height').optional().isInt({ min: 50, max: 500 }).withMessage('Height must be between 50 and 500'),
                body('scale').optional().isInt({ min: 1, max: 10 }).withMessage('Scale must be between 1 and 10'),
                body('includetext').optional().isBoolean().withMessage('includetext must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            this.barcodeController.generateBarcode.bind(this.barcodeController)
        );

        // Generate barcode as SVG
        this.router.post(
            '/generate/svg',
            [
                body('text').isString().withMessage('Text is required'),
                body('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
                body('width').optional().isInt({ min: 1, max: 10 }).withMessage('Width must be between 1 and 10'),
                body('height').optional().isInt({ min: 50, max: 500 }).withMessage('Height must be between 50 and 500'),
                body('scale').optional().isInt({ min: 1, max: 10 }).withMessage('Scale must be between 1 and 10'),
                body('includetext').optional().isBoolean().withMessage('includetext must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            this.barcodeController.generateBarcodeSVG.bind(this.barcodeController)
        );

        // Generate barcode as data URL
        this.router.post(
            '/generate/dataurl',
            [
                body('text').isString().withMessage('Text is required'),
                body('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
                body('width').optional().isInt({ min: 1, max: 10 }).withMessage('Width must be between 1 and 10'),
                body('height').optional().isInt({ min: 50, max: 500 }).withMessage('Height must be between 50 and 500'),
                body('scale').optional().isInt({ min: 1, max: 10 }).withMessage('Scale must be between 1 and 10'),
                body('includetext').optional().isBoolean().withMessage('includetext must be a boolean'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            this.barcodeController.generateBarcodeDataURL.bind(this.barcodeController)
        );

        // Generate barcode label
        this.router.post(
            '/generate/label',
            [
                body('text').isString().withMessage('Text is required'),
                body('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
                body('productName').optional().isString().withMessage('Product name must be a string'),
                body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
                body('sku').optional().isString().withMessage('SKU must be a string'),
                body('width').optional().isInt({ min: 100, max: 500 }).withMessage('Width must be between 100 and 500'),
                body('height').optional().isInt({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300'),
            ],
            ValidationMiddleware.validate,
            ValidationMiddleware.sanitizeInput,
            AuthMiddleware.authenticate,
            AuthMiddleware.authorize('ADMIN', 'OWNER', 'STAFF'),
            this.barcodeController.generateBarcodeLabel.bind(this.barcodeController)
        );

        // Get supported barcode formats
        this.router.get(
            '/formats',
            this.barcodeController.getSupportedFormats.bind(this.barcodeController)
        );

        // Scan barcode (placeholder)
        this.router.post(
            '/scan',
            [
                body('image').isString().withMessage('Image data is required'),
            ],
            ValidationMiddleware.validate,
            AuthMiddleware.authenticate,
            this.barcodeController.scanBarcode.bind(this.barcodeController)
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
