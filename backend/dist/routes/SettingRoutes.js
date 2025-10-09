"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const SettingController_1 = require("@/controllers/SettingController");
const ValidationMiddleware_1 = require("@/middleware/ValidationMiddleware");
const AuthMiddleware_1 = require("@/middleware/AuthMiddleware");
class SettingRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.settingController = new SettingController_1.SettingController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/whatsapp', AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.getWhatsAppSettings.bind(this.settingController));
        this.router.put('/whatsapp', [
            (0, express_validator_1.body)('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
            (0, express_validator_1.body)('method').optional().isIn(['web', 'api']).withMessage('Method must be web or api'),
            (0, express_validator_1.body)('apiUrl').optional().isString().withMessage('API URL must be a string'),
            (0, express_validator_1.body)('accessToken').optional().isString().withMessage('Access token must be a string'),
            (0, express_validator_1.body)('phoneNumberId').optional().isString().withMessage('Phone number ID must be a string'),
            (0, express_validator_1.body)('businessAccountId').optional().isString().withMessage('Business account ID must be a string'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, ValidationMiddleware_1.ValidationMiddleware.sanitizeInput, AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.updateWhatsAppSettings.bind(this.settingController));
        this.router.post('/whatsapp/test', AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.testWhatsAppConnection.bind(this.settingController));
        this.router.get('/business/info', AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.getBusinessSettings.bind(this.settingController));
        this.router.put('/business/info', AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.updateBusinessSettings.bind(this.settingController));
        this.router.post('/business/logo', [
            (0, express_validator_1.body)('logo').isString().withMessage('Logo data is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.uploadLogo.bind(this.settingController));
        this.router.post('/business/generate-sample-invoice', [
            (0, express_validator_1.body)('billData').isObject().withMessage('Bill data is required'),
            (0, express_validator_1.body)('template').isIn(['modern', 'classic', 'minimal', 'elegant']).withMessage('Template must be one of: modern, classic, minimal, elegant'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.generateSampleInvoice.bind(this.settingController));
        this.router.get('/:category', [
            (0, express_validator_1.param)('category').isString().withMessage('Category is required'),
        ], ValidationMiddleware_1.ValidationMiddleware.validate, AuthMiddleware_1.AuthMiddleware.authenticate, this.settingController.getSettingsByCategory.bind(this.settingController));
    }
    getRouter() {
        return this.router;
    }
}
exports.SettingRoutes = SettingRoutes;
//# sourceMappingURL=SettingRoutes.js.map