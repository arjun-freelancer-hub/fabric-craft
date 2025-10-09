"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingController = void 0;
const SettingModel_1 = require("@/models/SettingModel");
const BusinessSettingModel_1 = require("@/models/BusinessSettingModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
const InvoicePDFService_1 = require("@/services/InvoicePDFService");
class SettingController {
    constructor() {
        this.settingModel = new SettingModel_1.SettingModel();
        this.businessSettingModel = new BusinessSettingModel_1.BusinessSettingModel();
        this.invoicePDFService = new InvoicePDFService_1.InvoicePDFService();
        this.logger = new Logger_1.Logger();
    }
    async getWhatsAppSettings(req, res, next) {
        try {
            const settings = await this.settingModel.getWhatsAppSettings();
            res.status(200).json({
                success: true,
                data: { settings },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateWhatsAppSettings(req, res, next) {
        try {
            const { enabled, method, apiUrl, accessToken, phoneNumberId, businessAccountId } = req.body;
            if (method && !['web', 'api'].includes(method)) {
                throw ErrorHandler_1.ErrorHandler.createError('Invalid method. Must be "web" or "api"', 400);
            }
            if (method === 'api' && enabled) {
                if (!apiUrl || !accessToken || !phoneNumberId) {
                    throw ErrorHandler_1.ErrorHandler.createError('API URL, Access Token, and Phone Number ID are required for API method', 400);
                }
            }
            const settings = {
                enabled: enabled !== undefined ? enabled : false,
                method: method || 'web',
                apiUrl,
                accessToken,
                phoneNumberId,
                businessAccountId,
            };
            await this.settingModel.saveWhatsAppSettings(settings);
            this.logger.info('WhatsApp settings updated', {
                userId: req.user.id,
                method: settings.method,
                enabled: settings.enabled,
            });
            res.status(200).json({
                success: true,
                data: { settings },
                message: 'WhatsApp settings updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async testWhatsAppConnection(req, res, next) {
        try {
            const settings = await this.settingModel.getWhatsAppSettings();
            if (!settings.enabled) {
                throw ErrorHandler_1.ErrorHandler.createError('WhatsApp is not enabled', 400);
            }
            if (settings.method === 'api') {
                if (!settings.accessToken || !settings.phoneNumberId) {
                    throw ErrorHandler_1.ErrorHandler.createError('WhatsApp API credentials not configured', 400);
                }
                res.status(200).json({
                    success: true,
                    message: 'WhatsApp API credentials are configured. Full connection test not yet implemented.',
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    message: 'WhatsApp Web link method is configured correctly',
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async getSettingsByCategory(req, res, next) {
        try {
            const { category } = req.params;
            const settings = await this.settingModel.getSettingsByCategory(category);
            res.status(200).json({
                success: true,
                data: { settings },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBusinessSettings(req, res, next) {
        try {
            const settings = await this.businessSettingModel.getBusinessSettings();
            res.status(200).json({
                success: true,
                data: { settings },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBusinessSettings(req, res, next) {
        try {
            await this.businessSettingModel.saveBusinessSettings(req.body);
            this.logger.info('Business settings updated', {
                userId: req.user.id,
            });
            const settings = await this.businessSettingModel.getBusinessSettings();
            res.status(200).json({
                success: true,
                data: { settings },
                message: 'Business settings updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async uploadLogo(req, res, next) {
        try {
            const { logo } = req.body;
            if (!logo) {
                throw ErrorHandler_1.ErrorHandler.createError('Logo data is required', 400);
            }
            await this.businessSettingModel.saveBusinessSettings({ businessLogo: logo });
            this.logger.info('Business logo uploaded', {
                userId: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { logo },
                message: 'Logo uploaded successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateSampleInvoice(req, res, next) {
        try {
            const { billData, template } = req.body;
            if (!billData || !template) {
                throw ErrorHandler_1.ErrorHandler.createError('Bill data and template are required', 400);
            }
            const businessSettings = await this.businessSettingModel.getBusinessSettings();
            const pdfBuffer = await this.invoicePDFService.generateInvoice(billData, businessSettings, template);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="sample-invoice-${template}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            this.logger.info('Sample invoice generated', {
                userId: req.user.id,
                template,
            });
            res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SettingController = SettingController;
//# sourceMappingURL=SettingController.js.map