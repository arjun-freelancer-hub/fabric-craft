"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const BarcodeController_1 = require("@/controllers/BarcodeController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class BarcodeRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.barcodeController = new BarcodeController_1.BarcodeController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/generate', [
            (0, express_validator_1.body)('text').isString().withMessage('Text is required'),
            (0, express_validator_1.body)('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
            (0, express_validator_1.body)('width').optional().isInt({ min: 1, max: 10 }).withMessage('Width must be between 1 and 10'),
            (0, express_validator_1.body)('height').optional().isInt({ min: 50, max: 500 }).withMessage('Height must be between 50 and 500'),
            (0, express_validator_1.body)('scale').optional().isInt({ min: 1, max: 10 }).withMessage('Scale must be between 1 and 10'),
            (0, express_validator_1.body)('includetext').optional().isBoolean().withMessage('includetext must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.barcodeController.generateBarcode.bind(this.barcodeController));
        this.router.post('/generate/svg', [
            (0, express_validator_1.body)('text').isString().withMessage('Text is required'),
            (0, express_validator_1.body)('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
            (0, express_validator_1.body)('width').optional().isInt({ min: 1, max: 10 }).withMessage('Width must be between 1 and 10'),
            (0, express_validator_1.body)('height').optional().isInt({ min: 50, max: 500 }).withMessage('Height must be between 50 and 500'),
            (0, express_validator_1.body)('scale').optional().isInt({ min: 1, max: 10 }).withMessage('Scale must be between 1 and 10'),
            (0, express_validator_1.body)('includetext').optional().isBoolean().withMessage('includetext must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.barcodeController.generateBarcodeSVG.bind(this.barcodeController));
        this.router.post('/generate/dataurl', [
            (0, express_validator_1.body)('text').isString().withMessage('Text is required'),
            (0, express_validator_1.body)('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
            (0, express_validator_1.body)('width').optional().isInt({ min: 1, max: 10 }).withMessage('Width must be between 1 and 10'),
            (0, express_validator_1.body)('height').optional().isInt({ min: 50, max: 500 }).withMessage('Height must be between 50 and 500'),
            (0, express_validator_1.body)('scale').optional().isInt({ min: 1, max: 10 }).withMessage('Scale must be between 1 and 10'),
            (0, express_validator_1.body)('includetext').optional().isBoolean().withMessage('includetext must be a boolean'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, this.barcodeController.generateBarcodeDataURL.bind(this.barcodeController));
        this.router.post('/generate/label', [
            (0, express_validator_1.body)('text').isString().withMessage('Text is required'),
            (0, express_validator_1.body)('format').optional().isIn(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE']).withMessage('Invalid barcode format'),
            (0, express_validator_1.body)('productName').optional().isString().withMessage('Product name must be a string'),
            (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
            (0, express_validator_1.body)('sku').optional().isString().withMessage('SKU must be a string'),
            (0, express_validator_1.body)('width').optional().isInt({ min: 100, max: 500 }).withMessage('Width must be between 100 and 500'),
            (0, express_validator_1.body)('height').optional().isInt({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, AuthMiddleware_1.AuthMiddleware.authorize('ADMIN', 'OWNER', 'STAFF'), this.barcodeController.generateBarcodeLabel.bind(this.barcodeController));
        this.router.get('/formats', this.barcodeController.getSupportedFormats.bind(this.barcodeController));
        this.router.post('/scan', [
            (0, express_validator_1.body)('image').isString().withMessage('Image data is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.barcodeController.scanBarcode.bind(this.barcodeController));
    }
    getRouter() {
        return this.router;
    }
}
exports.BarcodeRoutes = BarcodeRoutes;
//# sourceMappingURL=BarcodeRoutes.js.map