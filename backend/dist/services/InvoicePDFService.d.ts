import { BusinessSettings } from '@/models/BusinessSettingModel';
export interface InvoiceData {
    id: string;
    billNumber: string;
    createdAt: Date;
    customer: {
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
        address?: string;
    };
    items: Array<{
        customName: string;
        description?: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        isTailoring?: boolean;
        measurements?: any;
        notes?: string;
    }>;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    notes?: string;
}
export declare class InvoicePDFService {
    private logger;
    constructor();
    generateInvoice(invoiceData: InvoiceData, businessSettings: BusinessSettings, template?: 'modern' | 'classic' | 'minimal' | 'elegant'): Promise<Buffer>;
    private formatMeasurements;
    private generateModernTemplate;
    private generateClassicTemplate;
    private generateMinimalTemplate;
    private generateElegantTemplate;
}
//# sourceMappingURL=InvoicePDFService.d.ts.map