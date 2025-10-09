"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const Logger_1 = require("@/utils/Logger");
const SettingModel_1 = require("@/models/SettingModel");
class WhatsAppService {
    constructor() {
        this.logger = new Logger_1.Logger();
        this.settingModel = new SettingModel_1.SettingModel();
    }
    async getConfig() {
        try {
            const settings = await this.settingModel.getWhatsAppSettings();
            if (!settings || !settings.enabled) {
                return {
                    enabled: true,
                    method: 'web',
                };
            }
            return settings;
        }
        catch (error) {
            this.logger.error('Error getting WhatsApp config, using defaults:', error);
            return {
                enabled: true,
                method: 'web',
            };
        }
    }
    async sendInvoice(phoneNumber, billData, customMessage) {
        try {
            const config = await this.getConfig();
            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            const message = customMessage || this.getDefaultInvoiceMessage(billData);
            if (!config.enabled) {
                throw new Error('WhatsApp integration is not enabled');
            }
            if (config.method === 'api' && config.accessToken && config.phoneNumberId) {
                this.logger.warn('WhatsApp Business API integration not yet fully implemented, falling back to web link');
                const whatsappUrl = this.generateWhatsAppLink(formattedNumber, message);
                return {
                    success: true,
                    method: 'link',
                    url: whatsappUrl,
                };
            }
            const whatsappUrl = this.generateWhatsAppLink(formattedNumber, message);
            this.logger.info('WhatsApp link generated', {
                phoneNumber: formattedNumber,
                billId: billData.id,
                billNumber: billData.billNumber,
                method: config.method,
            });
            return {
                success: true,
                method: 'link',
                url: whatsappUrl,
            };
        }
        catch (error) {
            this.logger.error('Failed to process WhatsApp request:', error);
            throw error;
        }
    }
    generateWhatsAppLink(phoneNumber, message) {
        const encodedMessage = encodeURIComponent(message);
        return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    }
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        cleaned = cleaned.replace(/^0+/, '');
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }
        return cleaned;
    }
    getDefaultInvoiceMessage(billData) {
        const date = new Date(billData.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const apiUrl = process.env.API_URL || 'http://localhost:5000';
        const pdfLink = `${apiUrl}/api/bills/${billData.id}/invoice?format=pdf`;
        return `🏪 *FabricCraft Clothing Store*

Hello! Your invoice is ready 📋

📄 *Invoice Number:* ${billData.billNumber}
💰 *Total Amount:* ₹${billData.finalAmount}
📅 *Date:* ${date}
${billData.paymentStatus === 'PAID' ? '✅ *Status:* Paid' : '⏳ *Status:* Pending'}

📥 *Download Invoice PDF:*
${pdfLink}

Thank you for your business! 🙏

For any queries, please contact us.`;
    }
    async isApiConfigured() {
        const config = await this.getConfig();
        return !!(config.enabled &&
            config.method === 'api' &&
            config.accessToken &&
            config.phoneNumberId &&
            config.apiUrl);
    }
    validatePhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return cleaned.length === 10 || cleaned.length === 12;
    }
}
exports.WhatsAppService = WhatsAppService;
//# sourceMappingURL=WhatsAppService.js.map