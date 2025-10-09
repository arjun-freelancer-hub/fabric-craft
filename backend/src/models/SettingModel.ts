import { Setting } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface WhatsAppSettings {
    enabled: boolean;
    method: 'web' | 'api';
    apiUrl?: string;
    accessToken?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
}

export class SettingModel extends BaseModel<Setting> {
    getTableName(): string {
        return 'setting';
    }

    /**
     * Get a setting by key
     */
    public async getSetting(key: string): Promise<Setting | null> {
        try {
            const setting = await this.prisma.setting.findUnique({
                where: { key },
            });
            return setting;
        } catch (error) {
            this.logger.error('Error getting setting:', error);
            throw error;
        }
    }

    /**
     * Get setting value by key
     */
    public async getSettingValue(key: string, defaultValue?: any): Promise<any> {
        try {
            const setting = await this.getSetting(key);
            if (!setting) {
                return defaultValue;
            }

            // Parse value based on type
            switch (setting.type) {
                case 'boolean':
                    return setting.value === 'true';
                case 'number':
                    return Number(setting.value);
                case 'json':
                    return JSON.parse(setting.value);
                default:
                    return setting.value;
            }
        } catch (error) {
            this.logger.error('Error getting setting value:', error);
            return defaultValue;
        }
    }

    /**
     * Set a setting value
     */
    public async setSetting(
        key: string,
        value: any,
        type: string = 'string',
        category: string = 'general'
    ): Promise<Setting> {
        try {
            let stringValue: string;

            // Convert value to string based on type
            switch (type) {
                case 'boolean':
                    stringValue = value ? 'true' : 'false';
                    break;
                case 'number':
                    stringValue = String(value);
                    break;
                case 'json':
                    stringValue = JSON.stringify(value);
                    break;
                default:
                    stringValue = String(value);
            }

            const setting = await this.prisma.setting.upsert({
                where: { key },
                create: {
                    key,
                    value: stringValue,
                    type,
                    category,
                },
                update: {
                    value: stringValue,
                    type,
                    category,
                },
            });

            this.logger.info('Setting updated', { key, category });
            return setting;
        } catch (error) {
            this.logger.error('Error setting value:', error);
            throw error;
        }
    }

    /**
     * Get all settings in a category
     */
    public async getSettingsByCategory(category: string): Promise<Setting[]> {
        try {
            const settings = await this.prisma.setting.findMany({
                where: { category },
                orderBy: { key: 'asc' },
            });
            return settings;
        } catch (error) {
            this.logger.error('Error getting settings by category:', error);
            throw error;
        }
    }

    /**
     * Get WhatsApp settings
     */
    public async getWhatsAppSettings(): Promise<WhatsAppSettings> {
        try {
            const settings = await this.getSettingsByCategory('whatsapp');

            const whatsappSettings: WhatsAppSettings = {
                enabled: false,
                method: 'web',
            };

            settings.forEach(setting => {
                const value = this.parseSettingValue(setting);
                switch (setting.key) {
                    case 'whatsapp.enabled':
                        whatsappSettings.enabled = value;
                        break;
                    case 'whatsapp.method':
                        whatsappSettings.method = value;
                        break;
                    case 'whatsapp.apiUrl':
                        whatsappSettings.apiUrl = value;
                        break;
                    case 'whatsapp.accessToken':
                        whatsappSettings.accessToken = value;
                        break;
                    case 'whatsapp.phoneNumberId':
                        whatsappSettings.phoneNumberId = value;
                        break;
                    case 'whatsapp.businessAccountId':
                        whatsappSettings.businessAccountId = value;
                        break;
                }
            });

            return whatsappSettings;
        } catch (error) {
            this.logger.error('Error getting WhatsApp settings:', error);
            throw error;
        }
    }

    /**
     * Save WhatsApp settings
     */
    public async saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
        try {
            await this.setSetting('whatsapp.enabled', settings.enabled, 'boolean', 'whatsapp');
            await this.setSetting('whatsapp.method', settings.method, 'string', 'whatsapp');

            if (settings.apiUrl) {
                await this.setSetting('whatsapp.apiUrl', settings.apiUrl, 'string', 'whatsapp');
            }
            if (settings.accessToken) {
                await this.setSetting('whatsapp.accessToken', settings.accessToken, 'string', 'whatsapp');
            }
            if (settings.phoneNumberId) {
                await this.setSetting('whatsapp.phoneNumberId', settings.phoneNumberId, 'string', 'whatsapp');
            }
            if (settings.businessAccountId) {
                await this.setSetting('whatsapp.businessAccountId', settings.businessAccountId, 'string', 'whatsapp');
            }

            this.logger.info('WhatsApp settings saved successfully');
        } catch (error) {
            this.logger.error('Error saving WhatsApp settings:', error);
            throw error;
        }
    }

    /**
     * Delete a setting
     */
    public async deleteSetting(key: string): Promise<void> {
        try {
            await this.prisma.setting.delete({
                where: { key },
            });
            this.logger.info('Setting deleted', { key });
        } catch (error) {
            this.logger.error('Error deleting setting:', error);
            throw error;
        }
    }

    /**
     * Parse setting value based on type
     */
    protected parseSettingValue(setting: Setting): any {
        switch (setting.type) {
            case 'boolean':
                return setting.value === 'true';
            case 'number':
                return Number(setting.value);
            case 'json':
                try {
                    return JSON.parse(setting.value);
                } catch {
                    return setting.value;
                }
            default:
                return setting.value;
        }
    }
}

