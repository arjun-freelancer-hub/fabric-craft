"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingModel = void 0;
const BaseModel_1 = require("./BaseModel");
class SettingModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'setting';
    }
    async getSetting(key) {
        try {
            const setting = await this.prisma.setting.findUnique({
                where: { key },
            });
            return setting;
        }
        catch (error) {
            this.logger.error('Error getting setting:', error);
            throw error;
        }
    }
    async getSettingValue(key, defaultValue) {
        try {
            const setting = await this.getSetting(key);
            if (!setting) {
                return defaultValue;
            }
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
        }
        catch (error) {
            this.logger.error('Error getting setting value:', error);
            return defaultValue;
        }
    }
    async setSetting(key, value, type = 'string', category = 'general') {
        try {
            let stringValue;
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
        }
        catch (error) {
            this.logger.error('Error setting value:', error);
            throw error;
        }
    }
    async getSettingsByCategory(category) {
        try {
            const settings = await this.prisma.setting.findMany({
                where: { category },
                orderBy: { key: 'asc' },
            });
            return settings;
        }
        catch (error) {
            this.logger.error('Error getting settings by category:', error);
            throw error;
        }
    }
    async getWhatsAppSettings() {
        try {
            const settings = await this.getSettingsByCategory('whatsapp');
            const whatsappSettings = {
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
        }
        catch (error) {
            this.logger.error('Error getting WhatsApp settings:', error);
            throw error;
        }
    }
    async saveWhatsAppSettings(settings) {
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
        }
        catch (error) {
            this.logger.error('Error saving WhatsApp settings:', error);
            throw error;
        }
    }
    async deleteSetting(key) {
        try {
            await this.prisma.setting.delete({
                where: { key },
            });
            this.logger.info('Setting deleted', { key });
        }
        catch (error) {
            this.logger.error('Error deleting setting:', error);
            throw error;
        }
    }
    parseSettingValue(setting) {
        switch (setting.type) {
            case 'boolean':
                return setting.value === 'true';
            case 'number':
                return Number(setting.value);
            case 'json':
                try {
                    return JSON.parse(setting.value);
                }
                catch {
                    return setting.value;
                }
            default:
                return setting.value;
        }
    }
}
exports.SettingModel = SettingModel;
//# sourceMappingURL=SettingModel.js.map