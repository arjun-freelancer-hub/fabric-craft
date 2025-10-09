import { Logger } from '@/utils/Logger';
import { Bill } from '@prisma/client';
import { SettingModel, WhatsAppSettings } from '@/models/SettingModel';

export class WhatsAppService {
    private logger: Logger;
    private settingModel: SettingModel;

    constructor() {
        this.logger = new Logger();
        this.settingModel = new SettingModel();
    }

    /**
     * Get WhatsApp configuration from database or env
     */
    private async getConfig(): Promise<WhatsAppSettings> {
        try {
            const settings = await this.settingModel.getWhatsAppSettings();

            // If no settings found, use defaults
            if (!settings || !settings.enabled) {
                return {
                    enabled: true, // Enable by default with web method
                    method: 'web',
                };
            }

            return settings;
        } catch (error) {
            this.logger.error('Error getting WhatsApp config, using defaults:', error);
            return {
                enabled: true,
                method: 'web',
            };
        }
    }

    /**
     * Send invoice via WhatsApp
     * Uses configured method (web or api)
     */
    public async sendInvoice(
        phoneNumber: string,
        billData: any,
        customMessage?: string
    ): Promise<{ success: boolean; method: 'link' | 'api'; url?: string }> {
        try {
            const config = await this.getConfig();
            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            const message = customMessage || this.getDefaultInvoiceMessage(billData);

            // Check if WhatsApp is enabled
            if (!config.enabled) {
                throw new Error('WhatsApp integration is not enabled');
            }

            // Use configured method
            if (config.method === 'api' && config.accessToken && config.phoneNumberId) {
                // TODO: Implement actual WhatsApp Business API integration
                this.logger.warn('WhatsApp Business API integration not yet fully implemented, falling back to web link');

                // For now, fall back to link method even if API is configured
                const whatsappUrl = this.generateWhatsAppLink(formattedNumber, message);

                return {
                    success: true,
                    method: 'link',
                    url: whatsappUrl,
                };
            }

            // Default: Generate WhatsApp web link
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
        } catch (error) {
            this.logger.error('Failed to process WhatsApp request:', error);
            throw error;
        }
    }

    /**
     * Generate WhatsApp web link with pre-filled message
     */
    private generateWhatsAppLink(phoneNumber: string, message: string): string {
        const encodedMessage = encodeURIComponent(message);
        // Use web.whatsapp.com for browser-based access (works on all platforms)
        return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    }

    /**
     * Format phone number for WhatsApp (remove all non-digits and add country code if needed)
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // Remove leading zeros
        cleaned = cleaned.replace(/^0+/, '');

        // Add country code if not present (assuming India +91)
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }

        return cleaned;
    }

    /**
     * Get default invoice message
     */
    private getDefaultInvoiceMessage(billData: any): string {
        const date = new Date(billData.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        // Generate PDF download link
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

    /**
     * Check if WhatsApp Business API is configured
     */
    public async isApiConfigured(): Promise<boolean> {
        const config = await this.getConfig();
        return !!(
            config.enabled &&
            config.method === 'api' &&
            config.accessToken &&
            config.phoneNumberId &&
            config.apiUrl
        );
    }

    /**
     * Validate phone number format
     */
    public validatePhoneNumber(phoneNumber: string): boolean {
        const cleaned = phoneNumber.replace(/\D/g, '');
        // Should be either 10 digits (without country code) or 12 digits (with country code)
        return cleaned.length === 10 || cleaned.length === 12;
    }
}

