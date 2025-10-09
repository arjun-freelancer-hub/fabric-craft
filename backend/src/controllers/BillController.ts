import { Request, Response, NextFunction } from 'express';
import { BillModel } from '@/models/BillModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';

import { WhatsAppService } from '@/services/WhatsAppService';

export class BillController {
    private billModel: BillModel;
    private logger: Logger;
    private whatsappService: WhatsAppService;

    constructor() {
        this.billModel = new BillModel();
        this.logger = new Logger();
        this.whatsappService = new WhatsAppService();
    }

    public async getBills(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { customerId, status, paymentStatus, dateFrom, dateTo } = req.query;
            const pagination = (req as any).pagination;

            let where: any = {};

            if (customerId) {
                where.customerId = customerId;
            }

            if (status) {
                where.status = status;
            }

            if (paymentStatus) {
                where.paymentStatus = paymentStatus;
            }

            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
                if (dateTo) where.createdAt.lte = new Date(dateTo as string);
            }

            const { data, total } = await this.billModel.findMany(where, {
                skip: pagination.offset,
                take: pagination.limit,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                include: {
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                },
            });

            res.status(200).json({
                success: true,
                data: {
                    bills: data,
                    pagination: {
                        page: pagination.page,
                        limit: pagination.limit,
                        total,
                        pages: Math.ceil(total / pagination.limit),
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getBillById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const bill = await this.billModel.getBillWithDetails(id);

            if (!bill) {
                throw ErrorHandler.createError('Bill not found', 404);
            }

            res.status(200).json({
                success: true,
                data: { bill },
            });
        } catch (error) {
            next(error);
        }
    }

    public async createBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const billData = {
                ...req.body,
                createdBy: req.user!.id,
            };

            const bill = await this.billModel.createBill(billData);

            this.logger.info('Bill created successfully', {
                billId: bill.id,
                billNumber: bill.billNumber,
                totalAmount: bill.finalAmount,
                createdBy: req.user!.id,
            });

            res.status(201).json({
                success: true,
                data: { bill },
                message: 'Bill created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async updateBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const bill = await this.billModel.updateBill(id, updateData);

            this.logger.info('Bill updated successfully', {
                billId: bill.id,
                billNumber: bill.billNumber,
                updatedBy: req.user!.id,
            });

            res.status(200).json({
                success: true,
                data: { bill },
                message: 'Bill updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async cancelBill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const bill = await this.billModel.cancelBill(id, reason);

            this.logger.info('Bill cancelled successfully', {
                billId: bill.id,
                billNumber: bill.billNumber,
                reason,
                cancelledBy: req.user!.id,
            });

            res.status(200).json({
                success: true,
                data: { bill },
                message: 'Bill cancelled successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async generateInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { format = 'pdf' } = req.query;

            const bill = await this.billModel.getBillWithDetails(id);
            if (!bill) {
                throw ErrorHandler.createError('Bill not found', 404);
            }

            if (format === 'html') {
                const html = await this.billModel.generateInvoiceHTML(bill);
                res.setHeader('Content-Type', 'text/html');
                res.send(html);
            } else {
                const pdfBuffer = await this.billModel.generateInvoicePDF(bill);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="invoice-${bill.billNumber}.pdf"`);
                res.send(pdfBuffer);
            }
        } catch (error) {
            next(error);
        }
    }

    public async sendInvoiceWhatsApp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { phoneNumber, message } = req.body;

            // Validate phone number
            if (!this.whatsappService.validatePhoneNumber(phoneNumber)) {
                throw ErrorHandler.createError('Invalid phone number format', 400);
            }

            const bill = await this.billModel.getBillWithDetails(id);
            if (!bill) {
                throw ErrorHandler.createError('Bill not found', 404);
            }

            // Send via WhatsApp service
            const result = await this.whatsappService.sendInvoice(phoneNumber, bill, message);

            this.logger.info('Invoice sent via WhatsApp', {
                billId: bill.id,
                billNumber: bill.billNumber,
                phoneNumber,
                method: result.method,
                sentBy: req.user!.id,
            });

            res.status(200).json({
                success: true,
                data: {
                    method: result.method,
                    whatsappUrl: result.url,
                },
                message: result.method === 'link'
                    ? 'WhatsApp link generated successfully. Please open the link to send the message.'
                    : 'Invoice sent via WhatsApp successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async addPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const paymentData = req.body;

            const payment = await this.billModel.addPayment(id, paymentData);

            this.logger.info('Payment added successfully', {
                billId: id,
                paymentId: payment.id,
                amount: payment.amount,
                method: payment.method,
                addedBy: req.user!.id,
            });

            res.status(201).json({
                success: true,
                data: { payment },
                message: 'Payment added successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    public async getBillPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const payments = await this.billModel.getBillPayments(id);

            res.status(200).json({
                success: true,
                data: { payments },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getBillStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dateFrom, dateTo } = req.query;
            const stats = await this.billModel.getBillStats({
                dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
                dateTo: dateTo ? new Date(dateTo as string) : undefined,
            });

            res.status(200).json({
                success: true,
                data: { stats },
            });
        } catch (error) {
            next(error);
        }
    }

    public async getDailySalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { date } = req.query;
            const reportDate = date ? new Date(date as string) : new Date();
            const report = await this.billModel.getDailySalesReport(reportDate);

            res.status(200).json({
                success: true,
                data: { report },
            });
        } catch (error) {
            next(error);
        }
    }
}
