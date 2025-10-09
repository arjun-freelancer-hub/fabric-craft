"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillModel = void 0;
const client_1 = require("@prisma/client");
const BaseModel_1 = require("./BaseModel");
const BusinessSettingModel_1 = require("./BusinessSettingModel");
const InvoicePDFService_1 = require("@/services/InvoicePDFService");
class BillModel extends BaseModel_1.BaseModel {
    constructor() {
        super();
        this.businessSettingModel = new BusinessSettingModel_1.BusinessSettingModel();
        this.invoicePDFService = new InvoicePDFService_1.InvoicePDFService();
    }
    getTableName() {
        return 'bill';
    }
    async createBill(data) {
        try {
            return await this.executeTransaction(async (prisma) => {
                const billNumber = await this.generateBillNumber();
                const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
                const discountAmount = data.discountAmount || 0;
                const taxAmount = data.taxAmount || 0;
                const finalAmount = totalAmount - discountAmount + taxAmount;
                const bill = await prisma.bill.create({
                    data: {
                        organizationId: data.organizationId,
                        billNumber,
                        customerId: data.customerId,
                        totalAmount,
                        discountAmount,
                        taxAmount,
                        finalAmount,
                        paymentMethod: data.paymentMethod,
                        paymentStatus: client_1.PaymentStatus.PENDING,
                        status: client_1.BillStatus.ACTIVE,
                        notes: data.notes,
                        deliveryDate: data.deliveryDate,
                        createdBy: data.createdBy,
                    },
                });
                const billItems = await Promise.all(data.items.map(item => prisma.billItem.create({
                    data: {
                        billId: bill.id,
                        productId: item.productId,
                        customName: item.customName,
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        discount: item.discount || 0,
                        isTailoring: item.isTailoring || false,
                        tailoringPrice: item.tailoringPrice,
                        measurements: item.measurements,
                        notes: item.notes,
                    },
                })));
                for (const item of data.items) {
                    if (item.productId) {
                        await prisma.inventory.create({
                            data: {
                                productId: item.productId,
                                quantity: -item.quantity,
                                type: 'OUT',
                                reference: billNumber,
                                notes: `Sale - Bill ${billNumber}`,
                                createdBy: data.createdBy,
                            },
                        });
                    }
                }
                this.logOperation('CREATE', {
                    id: bill.id,
                    billNumber: bill.billNumber,
                    totalAmount: bill.finalAmount
                });
                return bill;
            });
        }
        catch (error) {
            this.logger.error('Error creating bill:', error);
            throw error;
        }
    }
    async updateBill(id, data) {
        try {
            const bill = await this.update(id, data);
            this.logOperation('UPDATE', { id: bill.id, billNumber: bill.billNumber });
            return bill;
        }
        catch (error) {
            this.logger.error('Error updating bill:', error);
            throw error;
        }
    }
    async cancelBill(id, reason) {
        try {
            const bill = await this.update(id, {
                status: client_1.BillStatus.CANCELLED,
                notes: reason ? `${reason} - ${new Date().toISOString()}` : undefined,
            });
            this.logOperation('CANCEL', { id: bill.id, billNumber: bill.billNumber, reason });
            return bill;
        }
        catch (error) {
            this.logger.error('Error cancelling bill:', error);
            throw error;
        }
    }
    async getBillWithDetails(id) {
        try {
            const bill = await this.prisma.bill.findUnique({
                where: { id },
                include: {
                    customer: true,
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                    barcode: true,
                                },
                            },
                        },
                    },
                    payments: true,
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
            return bill;
        }
        catch (error) {
            this.logger.error('Error getting bill with details:', error);
            throw error;
        }
    }
    async addPayment(billId, data) {
        try {
            return await this.executeTransaction(async (prisma) => {
                const payment = await prisma.payment.create({
                    data: {
                        billId,
                        amount: data.amount,
                        method: data.method,
                        reference: data.reference,
                        notes: data.notes,
                        status: client_1.PaymentStatus.COMPLETED,
                    },
                });
                const bill = await prisma.bill.findUnique({
                    where: { id: billId },
                    include: { payments: true },
                });
                if (bill) {
                    const totalPaid = bill.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(data.amount);
                    let paymentStatus;
                    if (totalPaid >= Number(bill.finalAmount)) {
                        paymentStatus = client_1.PaymentStatus.COMPLETED;
                    }
                    else if (totalPaid > 0) {
                        paymentStatus = client_1.PaymentStatus.PARTIAL;
                    }
                    else {
                        paymentStatus = client_1.PaymentStatus.PENDING;
                    }
                    await prisma.bill.update({
                        where: { id: billId },
                        data: { paymentStatus },
                    });
                }
                this.logOperation('ADD_PAYMENT', {
                    billId,
                    paymentId: payment.id,
                    amount: payment.amount
                });
                return payment;
            });
        }
        catch (error) {
            this.logger.error('Error adding payment:', error);
            throw error;
        }
    }
    async getBillPayments(billId) {
        try {
            const payments = await this.prisma.payment.findMany({
                where: { billId },
                orderBy: { createdAt: 'desc' },
            });
            return payments;
        }
        catch (error) {
            this.logger.error('Error getting bill payments:', error);
            throw error;
        }
    }
    async getBillStats(options = {}) {
        try {
            const where = {
                status: 'ACTIVE',
            };
            if (options.dateFrom || options.dateTo) {
                where.createdAt = {};
                if (options.dateFrom)
                    where.createdAt.gte = options.dateFrom;
                if (options.dateTo)
                    where.createdAt.lte = options.dateTo;
            }
            const [totalBills, totalAmount, paymentMethodStats, statusStats, dailySales,] = await Promise.all([
                this.prisma.bill.count({ where }),
                this.prisma.bill.aggregate({
                    where,
                    _sum: { finalAmount: true },
                }),
                this.prisma.bill.groupBy({
                    by: ['paymentMethod'],
                    where,
                    _sum: { finalAmount: true },
                }),
                this.prisma.bill.groupBy({
                    by: ['status'],
                    where,
                    _count: { id: true },
                }),
                this.prisma.bill.groupBy({
                    by: ['createdAt'],
                    where,
                    _sum: { finalAmount: true },
                    _count: { id: true },
                    orderBy: { createdAt: 'desc' },
                    take: 30,
                }),
            ]);
            const paymentMethodBreakdown = paymentMethodStats.reduce((acc, item) => {
                acc[item.paymentMethod] = Number(item._sum.finalAmount) || 0;
                return acc;
            }, {});
            const statusBreakdown = statusStats.reduce((acc, item) => {
                acc[item.status] = item._count.id;
                return acc;
            }, {});
            const dailySalesFormatted = dailySales.map(item => ({
                date: item.createdAt.toISOString().split('T')[0],
                amount: Number(item._sum.finalAmount) || 0,
                count: item._count.id,
            }));
            return {
                totalBills,
                totalAmount: Number(totalAmount._sum.finalAmount) || 0,
                averageBillValue: totalBills > 0 ? (Number(totalAmount._sum.finalAmount) || 0) / totalBills : 0,
                paymentMethodBreakdown,
                statusBreakdown,
                dailySales: dailySalesFormatted,
            };
        }
        catch (error) {
            this.logger.error('Error getting bill stats:', error);
            throw error;
        }
    }
    async getDailySalesReport(date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const where = {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'ACTIVE',
            };
            const [bills, productStats, paymentStats] = await Promise.all([
                this.prisma.bill.findMany({
                    where,
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                this.prisma.billItem.groupBy({
                    by: ['productId'],
                    where: {
                        bill: where,
                    },
                    _sum: {
                        quantity: true,
                        totalPrice: true,
                    },
                    orderBy: {
                        _sum: {
                            totalPrice: 'desc',
                        },
                    },
                    take: 10,
                }),
                this.prisma.bill.groupBy({
                    by: ['paymentMethod'],
                    where,
                    _sum: { finalAmount: true },
                }),
            ]);
            const totalSales = bills.reduce((sum, bill) => sum + Number(bill.finalAmount), 0);
            const billCount = bills.length;
            const averageBillValue = billCount > 0 ? totalSales / billCount : 0;
            const topProducts = await Promise.all(productStats.map(async (stat) => {
                const product = stat.productId ? await this.prisma.product.findUnique({
                    where: { id: stat.productId },
                    select: { name: true },
                }) : null;
                return {
                    productName: product?.name || 'Unknown Product',
                    quantity: Number(stat._sum.quantity) || 0,
                    totalAmount: Number(stat._sum.totalPrice) || 0,
                };
            }));
            const paymentMethods = paymentStats.reduce((acc, stat) => {
                acc[stat.paymentMethod] = Number(stat._sum.finalAmount) || 0;
                return acc;
            }, {});
            return {
                date: date.toISOString().split('T')[0],
                totalSales,
                billCount,
                averageBillValue,
                topProducts,
                paymentMethods,
            };
        }
        catch (error) {
            this.logger.error('Error getting daily sales report:', error);
            throw error;
        }
    }
    async generateInvoicePDF(bill) {
        try {
            const businessSettings = await this.businessSettingModel.getBusinessSettings();
            const invoiceData = {
                id: bill.id,
                billNumber: bill.billNumber,
                createdAt: bill.createdAt,
                customer: bill.customer ? {
                    firstName: bill.customer.firstName,
                    lastName: bill.customer.lastName,
                    phone: bill.customer.phone,
                    email: bill.customer.email,
                    address: bill.customer.address,
                } : {
                    firstName: 'Walk-in',
                    lastName: 'Customer',
                },
                items: bill.items.map((item) => ({
                    customName: item.product?.name || item.customName || 'Custom Item',
                    description: item.description,
                    quantity: Number(item.quantity),
                    unit: item.unit,
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice),
                    isTailoring: item.isTailoring || false,
                    measurements: item.measurements,
                    notes: item.notes,
                })),
                totalAmount: Number(bill.totalAmount),
                discountAmount: Number(bill.discountAmount),
                taxAmount: Number(bill.taxAmount),
                finalAmount: Number(bill.finalAmount),
                paymentMethod: bill.paymentMethod,
                paymentStatus: bill.paymentStatus,
                notes: bill.notes,
            };
            const pdfBuffer = await this.invoicePDFService.generateInvoice(invoiceData, businessSettings, businessSettings.invoiceTemplate);
            return pdfBuffer;
        }
        catch (error) {
            this.logger.error('Error generating invoice PDF:', error);
            throw error;
        }
    }
    async generateInvoiceHTML(bill) {
        try {
            const businessSettings = await this.businessSettingModel.getBusinessSettings();
            const currency = businessSettings.currencySymbol || '₹';
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice #${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
            .business-info { text-align: center; margin-bottom: 10px; color: #666; font-size: 14px; }
            .invoice-details { margin-bottom: 20px; display: flex; justify-content: space-between; }
            .customer-info { width: 48%; }
            .invoice-info { width: 48%; text-align: right; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .items-table th { background-color: #4F46E5; color: white; }
            .items-table tbody tr:nth-child(even) { background-color: #f9fafb; }
            .total-section { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd; }
            .final-total { background-color: #4F46E5; color: white; font-weight: bold; font-size: 18px; padding: 12px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${businessSettings.businessName}</h1>
            <div class="business-info">
              ${businessSettings.businessAddress ? `<div>${businessSettings.businessAddress}</div>` : ''}
              ${businessSettings.businessCity || businessSettings.businessState ? `<div>${businessSettings.businessCity || ''}, ${businessSettings.businessState || ''} ${businessSettings.businessPincode || ''}</div>` : ''}
              ${businessSettings.businessPhone ? `<div>Phone: ${businessSettings.businessPhone}</div>` : ''}
              ${businessSettings.businessEmail ? `<div>Email: ${businessSettings.businessEmail}</div>` : ''}
              ${businessSettings.businessGSTIN ? `<div>GSTIN: ${businessSettings.businessGSTIN}</div>` : ''}
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <h3>Bill To:</h3>
              <p><strong>${bill.customer ? `${bill.customer.firstName} ${bill.customer.lastName}` : 'Walk-in Customer'}</strong></p>
              ${bill.customer?.phone ? `<p>Phone: ${bill.customer.phone}</p>` : ''}
              ${bill.customer?.email ? `<p>Email: ${bill.customer.email}</p>` : ''}
              ${bill.customer?.address ? `<p>Address: ${bill.customer.address}</p>` : ''}
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${bill.billNumber}</p>
              <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString('en-IN')}</p>
              <p><strong>Status:</strong> ${bill.paymentStatus}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map((item) => {
                const measurements = item.isTailoring && item.measurements ? this.formatMeasurementsHTML(item.measurements) : '';
                return `
                <tr>
                  <td>
                    ${item.product?.name || item.customName || 'Custom Item'}
                    ${measurements ? `<br><small style="color: #666; font-size: 11px;">📏 ${measurements}</small>` : ''}
                  </td>
                  <td>${item.description || '-'}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>${currency}${Number(item.unitPrice).toFixed(2)}</td>
                  <td>${currency}${Number(item.totalPrice).toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${currency}${Number(bill.totalAmount).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Discount:</span>
              <span>-${currency}${Number(bill.discountAmount).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax (${businessSettings.taxRate}%):</span>
              <span>${currency}${Number(bill.taxAmount).toFixed(2)}</span>
            </div>
            <div class="final-total">
              <div style="display: flex; justify-content: space-between;">
                <span>TOTAL:</span>
                <span>${currency}${Number(bill.finalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${bill.notes ? `<div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #4F46E5;"><strong>Notes:</strong> ${bill.notes}</div>` : ''}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            ${businessSettings.businessWebsite ? `<p>${businessSettings.businessWebsite}</p>` : ''}
          </div>
        </body>
        </html>
      `;
            return html;
        }
        catch (error) {
            this.logger.error('Error generating invoice HTML:', error);
            throw error;
        }
    }
    formatMeasurementsHTML(measurements) {
        if (!measurements)
            return '';
        const measurementLabels = {
            chest: 'Chest',
            waist: 'Waist',
            hip: 'Hip',
            shoulder: 'Shoulder',
            sleeve: 'Sleeve',
            length: 'Length',
            inseam: 'Inseam',
            neck: 'Neck',
        };
        const parts = [];
        for (const [key, label] of Object.entries(measurementLabels)) {
            if (measurements[key] && measurements[key].trim() !== '') {
                parts.push(`${label}: ${measurements[key]}`);
            }
        }
        if (measurements.notes && measurements.notes.trim() !== '') {
            parts.push(`Notes: ${measurements.notes}`);
        }
        return parts.join(', ');
    }
    async generateBillNumber() {
        try {
            const businessSettings = await this.businessSettingModel.getBusinessSettings();
            const prefix = businessSettings.invoicePrefix || 'CS';
            const today = new Date();
            const year = today.getFullYear().toString().slice(-2);
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            const count = await this.prisma.bill.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });
            const sequence = (count + 1).toString().padStart(3, '0');
            return `${prefix}${year}${month}${day}${sequence}`;
        }
        catch (error) {
            this.logger.error('Error generating bill number:', error);
            throw error;
        }
    }
}
exports.BillModel = BillModel;
//# sourceMappingURL=BillModel.js.map