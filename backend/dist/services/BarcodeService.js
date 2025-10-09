"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeService = void 0;
const bwip_js_1 = __importDefault(require("bwip-js"));
const qrcode_1 = __importDefault(require("qrcode"));
const Logger_1 = require("@/utils/Logger");
class BarcodeService {
    constructor() {
        this.logger = new Logger_1.Logger();
    }
    async generateBarcode(text, format = 'CODE128', options = {}) {
        try {
            const barcodeOptions = {
                format,
                width: options.width || parseInt(process.env.BARCODE_DEFAULT_WIDTH || '2'),
                height: options.height || parseInt(process.env.BARCODE_DEFAULT_HEIGHT || '100'),
                text: options.text || text,
                scale: options.scale || 3,
                includetext: options.includetext !== false,
            };
            if (format === 'QRCODE') {
                return await this.generateQRCode(text, barcodeOptions);
            }
            else {
                return await this.generateLinearBarcode(text, barcodeOptions);
            }
        }
        catch (error) {
            this.logger.error('Error generating barcode:', error);
            throw error;
        }
    }
    async generateLinearBarcode(text, options) {
        try {
            const buffer = await bwip_js_1.default.toBuffer({
                bcid: options.format.toLowerCase(),
                text: text,
                scale: options.scale,
                height: options.height,
                width: options.width,
                includetext: options.includetext,
                textxalign: 'center',
                textyalign: 'below',
                textsize: 12,
                textfont: 'monospace',
            });
            return {
                data: buffer,
                format: options.format,
                text: text,
            };
        }
        catch (error) {
            this.logger.error('Error generating linear barcode:', error);
            throw new Error(`Failed to generate ${options.format} barcode: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async generateQRCode(text, options) {
        try {
            const qrOptions = {
                width: options.width * 10,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M',
            };
            const buffer = await qrcode_1.default.toBuffer(text, qrOptions);
            return {
                data: buffer,
                format: 'QRCODE',
                text: text,
            };
        }
        catch (error) {
            this.logger.error('Error generating QR code:', error);
            throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async generateBarcodeSVG(text, format = 'CODE128', options = {}) {
        try {
            const barcodeOptions = {
                format,
                width: options.width || 2,
                height: options.height || 100,
                text: options.text || text,
                scale: options.scale || 3,
                includetext: options.includetext !== false,
            };
            if (format === 'QRCODE') {
                return await qrcode_1.default.toString(text, { type: 'svg' });
            }
            else {
                return await bwip_js_1.default.toSVG({
                    bcid: format.toLowerCase(),
                    text: text,
                    scale: barcodeOptions.scale,
                    height: barcodeOptions.height,
                    width: barcodeOptions.width,
                    includetext: barcodeOptions.includetext,
                    textxalign: 'center',
                    textyalign: 'below',
                    textsize: 12,
                    textfont: 'monospace',
                });
            }
        }
        catch (error) {
            this.logger.error('Error generating barcode SVG:', error);
            throw error;
        }
    }
    async generateBarcodeDataURL(text, format = 'CODE128', options = {}) {
        try {
            const barcodeOptions = {
                format,
                width: options.width || 2,
                height: options.height || 100,
                text: options.text || text,
                scale: options.scale || 3,
                includetext: options.includetext !== false,
            };
            if (format === 'QRCODE') {
                return await qrcode_1.default.toDataURL(text, {
                    width: barcodeOptions.width * 10,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });
            }
            else {
                const buffer = await bwip_js_1.default.toBuffer({
                    bcid: format.toLowerCase(),
                    text: text,
                    scale: barcodeOptions.scale,
                    height: barcodeOptions.height,
                    width: barcodeOptions.width,
                    includetext: barcodeOptions.includetext,
                    textxalign: 'center',
                    textyalign: 'below',
                    textsize: 12,
                    textfont: 'monospace',
                });
                return `data:image/png;base64,${buffer.toString('base64')}`;
            }
        }
        catch (error) {
            this.logger.error('Error generating barcode data URL:', error);
            throw error;
        }
    }
    validateBarcodeFormat(format) {
        const validFormats = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE'];
        return validFormats.includes(format);
    }
    getSupportedFormats() {
        return ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE'];
    }
    async generateBarcodeLabel(text, format = 'CODE128', labelOptions = {}) {
        try {
            const { productName, price, sku, width = 200, height = 100 } = labelOptions;
            const barcodeResult = await this.generateBarcode(text, format, {
                width: 2,
                height: 50,
                includetext: false,
            });
            const buffer = await bwip_js_1.default.toBuffer({
                bcid: 'datamatrix',
                text: JSON.stringify({
                    barcode: text,
                    productName,
                    price,
                    sku,
                }),
                scale: 2,
                height: height,
                width: width,
                includetext: true,
                textxalign: 'center',
                textyalign: 'below',
                textsize: 10,
                textfont: 'monospace',
            });
            return buffer;
        }
        catch (error) {
            this.logger.error('Error generating barcode label:', error);
            throw error;
        }
    }
    async scanBarcode(imageBuffer) {
        try {
            this.logger.warn('Barcode scanning not implemented yet. This is a placeholder.');
            return null;
        }
        catch (error) {
            this.logger.error('Error scanning barcode:', error);
            throw error;
        }
    }
}
exports.BarcodeService = BarcodeService;
//# sourceMappingURL=BarcodeService.js.map