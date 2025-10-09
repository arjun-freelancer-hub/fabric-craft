"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeController = void 0;
const BarcodeService_1 = require("@/services/BarcodeService");
const Logger_1 = require("@/utils/Logger");
class BarcodeController {
    constructor() {
        this.barcodeService = new BarcodeService_1.BarcodeService();
        this.logger = new Logger_1.Logger();
    }
    async generateBarcode(req, res, next) {
        try {
            const { text, format, width, height, scale, includetext } = req.body;
            const result = await this.barcodeService.generateBarcode(text, format, {
                width,
                height,
                scale,
                includetext,
            });
            res.status(200).json({
                success: true,
                data: {
                    data: result.data.toString('base64'),
                    format: result.format,
                    text: result.text,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateBarcodeSVG(req, res, next) {
        try {
            const { text, format, width, height, scale, includetext } = req.body;
            const svg = await this.barcodeService.generateBarcodeSVG(text, format, {
                width,
                height,
                scale,
                includetext,
            });
            res.status(200).json({
                success: true,
                data: {
                    svg,
                    format,
                    text,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateBarcodeDataURL(req, res, next) {
        try {
            const { text, format, width, height, scale, includetext } = req.body;
            const dataUrl = await this.barcodeService.generateBarcodeDataURL(text, format, {
                width,
                height,
                scale,
                includetext,
            });
            res.status(200).json({
                success: true,
                data: {
                    dataUrl,
                    format,
                    text,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateBarcodeLabel(req, res, next) {
        try {
            const { text, format, productName, price, sku, width, height } = req.body;
            const labelBuffer = await this.barcodeService.generateBarcodeLabel(text, format, {
                productName,
                price,
                sku,
                width,
                height,
            });
            this.logger.info('Barcode label generated successfully', {
                text,
                format,
                generatedBy: req.user.id,
            });
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="barcode-label-${text}.png"`);
            res.send(labelBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    async getSupportedFormats(req, res, next) {
        try {
            const formats = this.barcodeService.getSupportedFormats();
            res.status(200).json({
                success: true,
                data: { formats },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async scanBarcode(req, res, next) {
        try {
            const { image } = req.body;
            const result = await this.barcodeService.scanBarcode(Buffer.from(image, 'base64'));
            this.logger.info('Barcode scanned successfully', {
                result,
                scannedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: { barcode: result },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BarcodeController = BarcodeController;
//# sourceMappingURL=BarcodeController.js.map