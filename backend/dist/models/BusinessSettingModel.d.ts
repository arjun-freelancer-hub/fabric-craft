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
    businessLogo?: string;
    invoiceTemplate: 'modern' | 'classic' | 'minimal' | 'elegant';
    invoicePrefix: string;
    taxRate: number;
    currency: string;
    currencySymbol: string;
}
export declare class BusinessSettingModel extends SettingModel {
    getBusinessSettings(): Promise<BusinessSettings>;
    saveBusinessSettings(settings: Partial<BusinessSettings>): Promise<void>;
}
//# sourceMappingURL=BusinessSettingModel.d.ts.map