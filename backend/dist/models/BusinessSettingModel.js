"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSettingModel = void 0;
const SettingModel_1 = require("./SettingModel");
class BusinessSettingModel extends SettingModel_1.SettingModel {
    async getBusinessSettings() {
        try {
            const settings = await this.getSettingsByCategory('business');
            const businessSettings = {
                businessName: 'FabricCraft Clothing Store',
                invoiceTemplate: 'modern',
                invoicePrefix: 'CS',
                taxRate: 18,
                currency: 'INR',
                currencySymbol: '₹',
            };
            settings.forEach(setting => {
                const value = this.parseSettingValue(setting);
                const key = setting.key.replace('business.', '');
                businessSettings[key] = value;
            });
            return businessSettings;
        }
        catch (error) {
            this.logger.error('Error getting business settings:', error);
            throw error;
        }
    }
    async saveBusinessSettings(settings) {
        try {
            const promises = [];
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
        }
        catch (error) {
            this.logger.error('Error saving business settings:', error);
            throw error;
        }
    }
}
exports.BusinessSettingModel = BusinessSettingModel;
//# sourceMappingURL=BusinessSettingModel.js.map