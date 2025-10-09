"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillController = void 0;
const BillModel_1 = require("@/models/BillModel");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
const WhatsAppService_1 = require("@/services/WhatsAppService");
class BillController {
    constructor() {
        this.billModel = new BillModel_1.BillModel();
        this.logger = new Logger_1.Logger();
        this.whatsappService = new WhatsAppService_1.WhatsAppService();
    }
    async getBills(req, res, next) {
        try {
            const { customerId, status, paymentStatus, dateFrom, dateTo } = req.query;
            const pagination = req.pagination;
            let where = {};
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
                if (dateFrom)
                    where.createdAt.gte = new Date(dateFrom);
                if (dateTo)
                    where.createdAt.lte = new Date(dateTo);
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
        }
        catch (error) {
            next(error);
        }
    }
    async getBillById(req, res, next) {
        try {
            const { id } = req.params;
            const bill = await this.billModel.getBillWithDetails(id);
            if (!bill) {
                throw ErrorHandler_1.ErrorHandler.createError('Bill not found', 404);
            }
            res.status(200).json({
                success: true,
                data: { bill },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createBill(req, res, next) {
        try {
            const billData = {
                ...req.body,
                createdBy: req.user.id,
            };
            const bill = await this.billModel.createBill(billData);
            this.logger.info('Bill created successfully', {
                billId: bill.id,
                billNumber: bill.billNumber,
                totalAmount: bill.finalAmount,
                createdBy: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { bill },
                message: 'Bill created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBill(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const bill = await this.billModel.updateBill(id, updateData);
            this.logger.info('Bill updated successfully', {
                billId: bill.id,
                billNumber: bill.billNumber,
                updatedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { bill },
                message: 'Bill updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelBill(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const bill = await this.billModel.cancelBill(id, reason);
            this.logger.info('Bill cancelled successfully', {
                billId: bill.id,
                billNumber: bill.billNumber,
                reason,
                cancelledBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { bill },
                message: 'Bill cancelled successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateInvoice(req, res, next) {
        try {
            const { id } = req.params;
            const { format = 'pdf' } = req.query;
            const bill = await this.billModel.getBillWithDetails(id);
            if (!bill) {
                throw ErrorHandler_1.ErrorHandler.createError('Bill not found', 404);
            }
            if (format === 'html') {
                const html = await this.billModel.generateInvoiceHTML(bill);
                res.setHeader('Content-Type', 'text/html');
                res.send(html);
            }
            else {
                const pdfBuffer = await this.billModel.generateInvoicePDF(bill);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="invoice-${bill.billNumber}.pdf"`);
                res.send(pdfBuffer);
            }
        }
        catch (error) {
            next(error);
        }
    }
    async sendInvoiceWhatsApp(req, res, next) {
        try {
            const { id } = req.params;
            const { phoneNumber, message } = req.body;
            if (!this.whatsappService.validatePhoneNumber(phoneNumber)) {
                throw ErrorHandler_1.ErrorHandler.createError('Invalid phone number format', 400);
            }
            const bill = await this.billModel.getBillWithDetails(id);
            if (!bill) {
                throw ErrorHandler_1.ErrorHandler.createError('Bill not found', 404);
            }
            const result = await this.whatsappService.sendInvoice(phoneNumber, bill, message);
            this.logger.info('Invoice sent via WhatsApp', {
                billId: bill.id,
                billNumber: bill.billNumber,
                phoneNumber,
                method: result.method,
                sentBy: req.user.id,
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
        }
        catch (error) {
            next(error);
        }
    }
    async addPayment(req, res, next) {
        try {
            const { id } = req.params;
            const paymentData = req.body;
            const payment = await this.billModel.addPayment(id, paymentData);
            this.logger.info('Payment added successfully', {
                billId: id,
                paymentId: payment.id,
                amount: payment.amount,
                method: payment.method,
                addedBy: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { payment },
                message: 'Payment added successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBillPayments(req, res, next) {
        try {
            const { id } = req.params;
            const payments = await this.billModel.getBillPayments(id);
            res.status(200).json({
                success: true,
                data: { payments },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBillStats(req, res, next) {
        try {
            const { dateFrom, dateTo } = req.query;
            const stats = await this.billModel.getBillStats({
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined,
            });
            res.status(200).json({
                success: true,
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDailySalesReport(req, res, next) {
        try {
            const { date } = req.query;
            const reportDate = date ? new Date(date) : new Date();
            const report = await this.billModel.getDailySalesReport(reportDate);
            res.status(200).json({
                success: true,
                data: { report },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BillController = BillController;
//# sourceMappingURL=BillController.js.map