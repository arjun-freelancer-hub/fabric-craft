import { Setting } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface WhatsAppSettings {
    enabled: boolean;
    method: 'web' | 'api';
    apiUrl?: string;
    accessToken?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
}
export declare class SettingModel extends BaseModel<Setting> {
    getTableName(): string;
    getSetting(key: string): Promise<Setting | null>;
    getSettingValue(key: string, defaultValue?: any): Promise<any>;
    setSetting(key: string, value: any, type?: string, category?: string): Promise<Setting>;
    getSettingsByCategory(category: string): Promise<Setting[]>;
    getWhatsAppSettings(): Promise<WhatsAppSettings>;
    saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void>;
    deleteSetting(key: string): Promise<void>;
    protected parseSettingValue(setting: Setting): any;
}
//# sourceMappingURL=SettingModel.d.ts.map