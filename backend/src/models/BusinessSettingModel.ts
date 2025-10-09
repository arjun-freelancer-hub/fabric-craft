import { Setting } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { SettingModel } from './SettingModel';

export interface BusinessSettings {
    businessName: string;
    businessAddress?: string;
    businessCity?: string;
    businessState?: string;
    businessPincode?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessWebsite?: string;
    businessGSTIN?: string;
    businessLogo?: string; // URL or base64
    invoiceTemplate: 'modern' | 'classic' | 'minimal' | 'elegant';
    invoicePrefix: string;
    taxRate: number;
    currency: string;
    currencySymbol: string;
}

export class BusinessSettingModel extends SettingModel {
    /**
     * Get business settings
     */
    public async getBusinessSettings(): Promise<BusinessSettings> {
        try {
            const settings = await this.getSettingsByCategory('business');

            const businessSettings: BusinessSettings = {
                businessName: 'FabricCraft Clothing Store',
                invoiceTemplate: 'modern',
                invoicePrefix: 'CS',
                taxRate: 18,
                currency: 'INR',
                currencySymbol: '₹',
            };

            settings.forEach(setting => {
                const value = this.parseSettingValue(setting);
                const key = setting.key.replace('business.', '') as keyof BusinessSettings;
                (businessSettings as any)[key] = value;
            });

            return businessSettings;
        } catch (error) {
            this.logger.error('Error getting business settings:', error);
            throw error;
        }
    }

    /**
     * Save business settings
     */
    public async saveBusinessSettings(settings: Partial<BusinessSettings>): Promise<void> {
        try {
            const promises: Promise<any>[] = [];

            if (settings.businessName !== undefined) {
                promises.push(this.setSetting('business.businessName', settings.businessName, 'string', 'business'));
            }
            if (settings.businessAddress !== undefined) {
                promises.push(this.setSetting('business.businessAddress', settings.businessAddress, 'string', 'business'));
            }
            if (settings.businessCity !== undefined) {
                promises.push(this.setSetting('business.businessCity', settings.businessCity, 'string', 'business'));
            }
            if (settings.businessState !== undefined) {
                promises.push(this.setSetting('business.businessState', settings.businessState, 'string', 'business'));
            }
            if (settings.businessPincode !== undefined) {
                promises.push(this.setSetting('business.businessPincode', settings.businessPincode, 'string', 'business'));
            }
            if (settings.businessPhone !== undefined) {
                promises.push(this.setSetting('business.businessPhone', settings.businessPhone, 'string', 'business'));
            }
            if (settings.businessEmail !== undefined) {
                promises.push(this.setSetting('business.businessEmail', settings.businessEmail, 'string', 'business'));
            }
            if (settings.businessWebsite !== undefined) {
                promises.push(this.setSetting('business.businessWebsite', settings.businessWebsite, 'string', 'business'));
            }
            if (settings.businessGSTIN !== undefined) {
                promises.push(this.setSetting('business.businessGSTIN', settings.businessGSTIN, 'string', 'business'));
            }
            if (settings.businessLogo !== undefined) {
                promises.push(this.setSetting('business.businessLogo', settings.businessLogo, 'string', 'business'));
            }
            if (settings.invoiceTemplate !== undefined) {
                promises.push(this.setSetting('business.invoiceTemplate', settings.invoiceTemplate, 'string', 'business'));
            }
            if (settings.invoicePrefix !== undefined) {
                promises.push(this.setSetting('business.invoicePrefix', settings.invoicePrefix, 'string', 'business'));
            }
            if (settings.taxRate !== undefined) {
                promises.push(this.setSetting('business.taxRate', settings.taxRate, 'number', 'business'));
            }
            if (settings.currency !== undefined) {
                promises.push(this.setSetting('business.currency', settings.currency, 'string', 'business'));
            }
            if (settings.currencySymbol !== undefined) {
                promises.push(this.setSetting('business.currencySymbol', settings.currencySymbol, 'string', 'business'));
            }

            await Promise.all(promises);

            this.logger.info('Business settings saved successfully');
        } catch (error) {
            this.logger.error('Error saving business settings:', error);
            throw error;
        }
    }

    // parseSettingValue inherited from parent SettingModel
}

