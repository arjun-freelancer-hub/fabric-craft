import { Bill, Payment, BillStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateBillData {
    organizationId: string;
    customerId?: string;
    items: Array<{
        productId?: string;
        customName?: string;
        description?: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        discount?: number;
        isTailoring?: boolean;
        tailoringPrice?: number;
        measurements?: any;
        notes?: string;
    }>;
    discountAmount?: number;
    taxAmount?: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    deliveryDate?: Date;
    createdBy: string;
}
export interface UpdateBillData {
    customerId?: string;
    items?: any[];
    discountAmount?: number;
    taxAmount?: number;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    status?: BillStatus;
    notes?: string;
    deliveryDate?: Date;
}
export interface AddPaymentData {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
}
export declare class BillModel extends BaseModel<Bill> {
    private businessSettingModel;
    private invoicePDFService;
    constructor();
    getTableName(): string;
    createBill(data: CreateBillData): Promise<Bill>;
    updateBill(id: string, data: UpdateBillData): Promise<Bill>;
    cancelBill(id: string, reason?: string): Promise<Bill>;
    getBillWithDetails(id: string): Promise<any>;
    addPayment(billId: string, data: AddPaymentData): Promise<Payment>;
    getBillPayments(billId: string): Promise<Payment[]>;
    getBillStats(options?: {
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<{
        totalBills: number;
        totalAmount: number;
        averageBillValue: number;
        paymentMethodBreakdown: Record<PaymentMethod, number>;
        statusBreakdown: Record<BillStatus, number>;
        dailySales: Array<{
            date: string;
            amount: number;
            count: number;
        }>;
    }>;
    getDailySalesReport(date: Date): Promise<{
        date: string;
        totalSales: number;
        billCount: number;
        averageBillValue: number;
        topProducts: Array<{
            productName: string;
            quantity: number;
            totalAmount: number;
        }>;
        paymentMethods: Record<PaymentMethod, number>;
    }>;
    generateInvoicePDF(bill: any): Promise<Buffer>;
    generateInvoiceHTML(bill: any): Promise<string>;
    private formatMeasurementsHTML;
    private generateBillNumber;
}
//# sourceMappingURL=BillModel.d.ts.map