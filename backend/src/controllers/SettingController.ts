import { Request, Response, NextFunction } from 'express';
import { SettingModel } from '@/models/SettingModel';
import { BusinessSettingModel } from '@/models/BusinessSettingModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';
import { InvoicePDFService } from '@/services/InvoicePDFService';

export class SettingController {
    private settingModel: SettingModel;
    private businessSettingModel: BusinessSettingModel;
    private invoicePDFService: InvoicePDFService;
    private logger: Logger;

    constructor() {
        this.settingModel = new SettingModel();
        this.businessSettingModel = new BusinessSettingModel();
        this.invoicePDFService = new InvoicePDFService();
        this.logger = new Logger();
    }

    /**
     * Get WhatsApp settings
     */
    public async getWhatsAppSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const settings = await this.settingModel.getWhatsAppSettings();

            res.status(200).json({
                success: true,
                data: { settings },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update WhatsApp settings
     */
    public async updateWhatsAppSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const { enabled, method, apiUrl, accessToken, phoneNumberId, businessAccountId } = req.body;

            // Validate method
            if (method && !['web', 'api'].includes(method)) {
                throw ErrorHandler.createError('Invalid method. Must be "web" or "api"', 400);
            }

            // If method is 'api', validate required fields
            if (method === 'api' && enabled) {
                if (!apiUrl || !accessToken || !phoneNumberId) {
                    throw ErrorHandler.createError(
                        'API URL, Access Token, and Phone Number ID are required for API method',
                        400
                    );
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
                userId: req.user!.id,
                method: settings.method,
                enabled: settings.enabled,
            });

            res.status(200).json({
                success: true,
                data: { settings },
                message: 'WhatsApp settings updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Test WhatsApp connection
     */
    public async testWhatsAppConnection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const settings = await this.settingModel.getWhatsAppSettings();

            if (!settings.enabled) {
                throw ErrorHandler.createError('WhatsApp is not enabled', 400);
            }

            if (settings.method === 'api') {
                // TODO: Implement actual API connection test
                // For now, just validate that credentials are present
                if (!settings.accessToken || !settings.phoneNumberId) {
                    throw ErrorHandler.createError('WhatsApp API credentials not configured', 400);
                }

                res.status(200).json({
                    success: true,
                    message: 'WhatsApp API credentials are configured. Full connection test not yet implemented.',
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'WhatsApp Web link method is configured correctly',
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all settings by category
     */
    public async getSettingsByCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const { category } = req.params;
            const settings = await this.settingModel.getSettingsByCategory(category);

            res.status(200).json({
                success: true,
                data: { settings },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get business settings
     */
    public async getBusinessSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const settings = await this.businessSettingModel.getBusinessSettings();

            res.status(200).json({
                success: true,
                data: { settings },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update business settings
     */
    public async updateBusinessSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            await this.businessSettingModel.saveBusinessSettings(req.body);

            this.logger.info('Business settings updated', {
                userId: req.user!.id,
            });

            const settings = await this.businessSettingModel.getBusinessSettings();

            res.status(200).json({
                success: true,
                data: { settings },
                message: 'Business settings updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload business logo
     */
    public async uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const { logo } = req.body; // Base64 image data

            if (!logo) {
                throw ErrorHandler.createError('Logo data is required', 400);
            }

            // Save logo as base64 in settings
            await this.businessSettingModel.saveBusinessSettings({ businessLogo: logo });

            this.logger.info('Business logo uploaded', {
                userId: req.user!.id,
            });

            res.status(200).json({
                success: true,
                data: { logo },
                message: 'Logo uploaded successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate sample invoice for template preview
     */
    public async generateSampleInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // Authentication required - role check will be done at workspace level

            const { billData, template } = req.body;

            if (!billData || !template) {
                throw ErrorHandler.createError('Bill data and template are required', 400);
            }

            // Get current business settings
            const businessSettings = await this.businessSettingModel.getBusinessSettings();

            // Generate sample invoice PDF
            const pdfBuffer = await this.invoicePDFService.generateInvoice(
                billData,
                businessSettings,
                template as 'modern' | 'classic' | 'minimal' | 'elegant'
            );

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="sample-invoice-${template}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            this.logger.info('Sample invoice generated', {
                userId: req.user!.id,
                template,
            });

            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }
}

