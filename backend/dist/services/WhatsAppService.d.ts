export declare class WhatsAppService {
    private logger;
    private settingModel;
    constructor();
    private getConfig;
    sendInvoice(phoneNumber: string, billData: any, customMessage?: string): Promise<{
        success: boolean;
        method: 'link' | 'api';
        url?: string;
    }>;
    private generateWhatsAppLink;
    private formatPhoneNumber;
    private getDefaultInvoiceMessage;
    isApiConfigured(): Promise<boolean>;
    validatePhoneNumber(phoneNumber: string): boolean;
}
//# sourceMappingURL=WhatsAppService.d.ts.map