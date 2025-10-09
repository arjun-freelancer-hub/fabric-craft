import PDFDocument from 'pdfkit';
import { Logger } from '@/utils/Logger';
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

export class InvoicePDFService {
    private logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    /**
     * Generate invoice PDF based on selected template
     */
    public async generateInvoice(
        invoiceData: InvoiceData,
        businessSettings: BusinessSettings,
        template: 'modern' | 'classic' | 'minimal' | 'elegant' = 'modern'
    ): Promise<Buffer> {
        switch (template) {
            case 'modern':
                return this.generateModernTemplate(invoiceData, businessSettings);
            case 'classic':
                return this.generateClassicTemplate(invoiceData, businessSettings);
            case 'minimal':
                return this.generateMinimalTemplate(invoiceData, businessSettings);
            case 'elegant':
                return this.generateElegantTemplate(invoiceData, businessSettings);
            default:
                return this.generateModernTemplate(invoiceData, businessSettings);
        }
    }

    /**
     * Helper method to format measurements for display
     */
    private formatMeasurements(measurements: any): string {
        if (!measurements) return '';

        const measurementLabels: { [key: string]: string } = {
            chest: 'Chest',
            waist: 'Waist',
            hip: 'Hip',
            shoulder: 'Shoulder',
            sleeve: 'Sleeve',
            length: 'Length',
            inseam: 'Inseam',
            neck: 'Neck',
        };

        const parts: string[] = [];
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

    /**
     * Modern Template - Clean with accent colors
     */
    private generateModernTemplate(invoice: InvoiceData, business: BusinessSettings): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);

                // Header with accent color
                doc.rect(0, 0, 612, 120).fill('#4F46E5');

                // Business Logo and Name
                if (business.businessLogo) {
                    try {
                        // Add logo if available (base64 image)
                        const logoBuffer = Buffer.from(business.businessLogo.split(',')[1], 'base64');
                        doc.image(logoBuffer, 50, 20, { width: 60, height: 60 });
                        doc.fillColor('#FFFFFF')
                            .fontSize(28)
                            .font('Helvetica-Bold')
                            .text(business.businessName, 120, 40);
                    } catch (error) {
                        // Fallback to text only if logo fails to load
                        doc.fillColor('#FFFFFF')
                            .fontSize(28)
                            .font('Helvetica-Bold')
                            .text(business.businessName, 50, 40);
                    }
                } else {
                    doc.fillColor('#FFFFFF')
                        .fontSize(28)
                        .font('Helvetica-Bold')
                        .text(business.businessName, 50, 40);
                }

                doc.fontSize(10)
                    .font('Helvetica')
                    .text(business.businessAddress || '', 50, 75)
                    .text(`${business.businessCity || ''}, ${business.businessState || ''} ${business.businessPincode || ''}`, 50, 90)
                    .text(`${business.businessPhone || ''} | ${business.businessEmail || ''}`, 50, 105);

                // Invoice Title
                doc.fillColor('#000000')
                    .fontSize(24)
                    .font('Helvetica-Bold')
                    .text('INVOICE', 400, 150, { align: 'right' });

                doc.fontSize(10)
                    .font('Helvetica')
                    .fillColor('#666666')
                    .text(`Invoice #: ${invoice.billNumber}`, 400, 180, { align: 'right' })
                    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 400, 195, { align: 'right' })
                    .text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 400, 210, { align: 'right' });

                // Customer Details Box
                doc.fillColor('#4F46E5')
                    .fontSize(12)
                    .font('Helvetica-Bold')
                    .text('BILL TO:', 50, 150);

                doc.roundedRect(50, 170, 250, 80, 5)
                    .stroke('#E5E7EB');

                doc.fillColor('#000000')
                    .fontSize(11)
                    .font('Helvetica-Bold')
                    .text(`${invoice.customer.firstName} ${invoice.customer.lastName}`, 60, 180);

                doc.fontSize(9)
                    .font('Helvetica')
                    .fillColor('#666666')
                    .text(invoice.customer.phone || '', 60, 200)
                    .text(invoice.customer.email || '', 60, 215)
                    .text(invoice.customer.address || '', 60, 230, { width: 230 });

                // Items Table
                let yPos = 280;

                // Table Header
                doc.rect(50, yPos, 512, 30).fill('#F3F4F6');

                doc.fillColor('#000000')
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text('ITEM', 60, yPos + 10)
                    .text('QTY', 300, yPos + 10)
                    .text('PRICE', 370, yPos + 10)
                    .text('AMOUNT', 480, yPos + 10, { align: 'right' });

                yPos += 40;

                // Table Items
                doc.font('Helvetica').fontSize(9);
                invoice.items.forEach((item, index) => {
                    if (yPos > 700) {
                        doc.addPage();
                        yPos = 50;
                    }

                    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                    const measurements = item.isTailoring && item.measurements ? this.formatMeasurements(item.measurements) : '';
                    const itemHeight = measurements ? 40 : 25;

                    doc.rect(50, yPos, 512, itemHeight).fill(bgColor);

                    doc.fillColor('#000000')
                        .text(item.customName, 60, yPos + 8, { width: 220 })
                        .text(`${item.quantity} ${item.unit}`, 300, yPos + 8)
                        .text(`${business.currencySymbol}${item.unitPrice.toFixed(2)}`, 370, yPos + 8)
                        .text(`${business.currencySymbol}${item.totalPrice.toFixed(2)}`, 480, yPos + 8, { align: 'right' });

                    // Display measurements if available
                    if (measurements) {
                        doc.fontSize(8)
                            .fillColor('#666666')
                            .text(`📏 ${measurements}`, 60, yPos + 23, { width: 500 });
                        doc.fontSize(9).fillColor('#000000');
                    }

                    yPos += itemHeight;
                });

                // Totals
                yPos += 20;

                doc.fontSize(10);
                [
                    { label: 'Subtotal:', value: invoice.totalAmount },
                    { label: 'Discount:', value: -invoice.discountAmount },
                    { label: `Tax (${business.taxRate}%):`, value: invoice.taxAmount },
                ].forEach(item => {
                    doc.fillColor('#666666')
                        .text(item.label, 370, yPos)
                        .fillColor('#000000')
                        .text(`${business.currencySymbol}${Math.abs(item.value).toFixed(2)}`, 480, yPos, { align: 'right' });
                    yPos += 20;
                });

                // Final Amount
                doc.rect(370, yPos, 192, 35).fill('#4F46E5');
                doc.fillColor('#FFFFFF')
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('TOTAL:', 380, yPos + 10)
                    .text(`${business.currencySymbol}${invoice.finalAmount.toFixed(2)}`, 480, yPos + 10, { align: 'right' });

                // Footer
                yPos += 60;
                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                }

                doc.fontSize(8)
                    .fillColor('#999999')
                    .font('Helvetica')
                    .text('Thank you for your business!', 50, yPos, { align: 'center', width: 512 });

                if (invoice.notes) {
                    doc.text(`Notes: ${invoice.notes}`, 50, yPos + 15, { align: 'center', width: 512 });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Classic Template - Traditional business style
     */
    private generateClassicTemplate(invoice: InvoiceData, business: BusinessSettings): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);

                // Header
                if (business.businessLogo) {
                    try {
                        // Add logo if available
                        const logoBuffer = Buffer.from(business.businessLogo.split(',')[1], 'base64');
                        doc.image(logoBuffer, 50, 30, { width: 50, height: 50 });
                        doc.fontSize(20)
                            .font('Helvetica-Bold')
                            .text(business.businessName, 110, 50);
                    } catch (error) {
                        // Fallback to text only
                        doc.fontSize(20)
                            .font('Helvetica-Bold')
                            .text(business.businessName, 50, 50);
                    }
                } else {
                    doc.fontSize(20)
                        .font('Helvetica-Bold')
                        .text(business.businessName, 50, 50);
                }

                doc.fontSize(9)
                    .font('Helvetica')
                    .text(business.businessAddress || '', 50, 80)
                    .text(`${business.businessPhone || ''} | ${business.businessEmail || ''}`, 50, 95);

                // Horizontal line
                doc.moveTo(50, 115).lineTo(562, 115).stroke();

                // Invoice Title
                doc.fontSize(18)
                    .font('Helvetica-Bold')
                    .text('INVOICE', 50, 130);

                // Invoice Details
                doc.fontSize(9)
                    .font('Helvetica')
                    .text(`Invoice Number: ${invoice.billNumber}`, 400, 140)
                    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, 400, 155)
                    .text(`Status: ${invoice.paymentStatus}`, 400, 170);

                // Bill To
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .text('Bill To:', 50, 180);

                doc.fontSize(10)
                    .font('Helvetica')
                    .text(`${invoice.customer.firstName} ${invoice.customer.lastName}`, 50, 200)
                    .text(invoice.customer.phone || '', 50, 215)
                    .text(invoice.customer.address || '', 50, 230);

                // Items Table
                let yPos = 280;

                // Table borders
                doc.rect(50, yPos, 512, 25).stroke();

                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text('Description', 60, yPos + 8)
                    .text('Qty', 350, yPos + 8)
                    .text('Rate', 420, yPos + 8)
                    .text('Amount', 490, yPos + 8);

                yPos += 25;

                // Items
                doc.font('Helvetica').fontSize(9);
                invoice.items.forEach(item => {
                    doc.rect(50, yPos, 512, 20).stroke();
                    doc.text(item.customName, 60, yPos + 6)
                        .text(`${item.quantity}`, 350, yPos + 6)
                        .text(`${business.currencySymbol}${item.unitPrice.toFixed(2)}`, 420, yPos + 6)
                        .text(`${business.currencySymbol}${item.totalPrice.toFixed(2)}`, 490, yPos + 6);
                    yPos += 20;
                });

                // Totals
                yPos += 10;
                doc.font('Helvetica-Bold')
                    .text('Subtotal:', 400, yPos)
                    .text(`${business.currencySymbol}${invoice.totalAmount.toFixed(2)}`, 490, yPos);

                yPos += 15;
                doc.text('Tax:', 400, yPos)
                    .text(`${business.currencySymbol}${invoice.taxAmount.toFixed(2)}`, 490, yPos);

                yPos += 15;
                doc.fontSize(12)
                    .text('TOTAL:', 400, yPos)
                    .text(`${business.currencySymbol}${invoice.finalAmount.toFixed(2)}`, 490, yPos);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Minimal Template - Clean and simple
     */
    private generateMinimalTemplate(invoice: InvoiceData, business: BusinessSettings): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 60 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);

                // Minimal header
                doc.fontSize(24)
                    .font('Helvetica-Bold')
                    .text('INVOICE', 60, 60);

                doc.fontSize(10)
                    .font('Helvetica')
                    .text(invoice.billNumber, 60, 95);

                // Business info (right aligned)
                if (business.businessLogo) {
                    try {
                        // Add logo if available (right aligned)
                        const logoBuffer = Buffer.from(business.businessLogo.split(',')[1], 'base64');
                        doc.image(logoBuffer, 460, 40, { width: 40, height: 40 });
                        doc.fontSize(10)
                            .text(business.businessName, 400, 60, { align: 'right' })
                            .fontSize(8)
                            .text(business.businessPhone || '', 400, 80, { align: 'right' });
                    } catch (error) {
                        // Fallback to text only
                        doc.fontSize(10)
                            .text(business.businessName, 400, 60, { align: 'right' })
                            .fontSize(8)
                            .text(business.businessPhone || '', 400, 80, { align: 'right' });
                    }
                } else {
                    doc.fontSize(10)
                        .text(business.businessName, 400, 60, { align: 'right' })
                        .fontSize(8)
                        .text(business.businessPhone || '', 400, 80, { align: 'right' });
                }

                // Customer
                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text('TO:', 60, 150);

                doc.font('Helvetica')
                    .text(`${invoice.customer.firstName} ${invoice.customer.lastName}`, 60, 170)
                    .fontSize(8)
                    .text(invoice.customer.phone || '', 60, 185);

                // Items - minimal table
                let yPos = 240;

                invoice.items.forEach(item => {
                    doc.fontSize(10)
                        .font('Helvetica')
                        .text(item.customName, 60, yPos)
                        .text(`${item.quantity} × ${business.currencySymbol}${item.unitPrice.toFixed(2)}`, 350, yPos)
                        .font('Helvetica-Bold')
                        .text(`${business.currencySymbol}${item.totalPrice.toFixed(2)}`, 490, yPos, { align: 'right' });

                    yPos += 25;
                });

                // Total
                yPos += 30;
                doc.moveTo(350, yPos).lineTo(552, yPos).stroke();
                yPos += 15;

                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .text('TOTAL', 350, yPos)
                    .text(`${business.currencySymbol}${invoice.finalAmount.toFixed(2)}`, 490, yPos, { align: 'right' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Elegant Template - Sophisticated design
     */
    private generateElegantTemplate(invoice: InvoiceData, business: BusinessSettings): Promise<Buffer> {
        // Similar implementation with elegant styling
        return this.generateModernTemplate(invoice, business); // Placeholder
    }
}

