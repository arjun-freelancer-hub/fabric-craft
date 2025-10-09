import bwipjs from 'bwip-js';
import QRCode from 'qrcode';
import { Logger } from '@/utils/Logger';

export type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'QRCODE';

export interface BarcodeOptions {
    format: BarcodeFormat;
    width?: number;
    height?: number;
    text?: string;
    scale?: number;
    includetext?: boolean;
}

export interface BarcodeResult {
    data: Buffer;
    format: BarcodeFormat;
    text: string;
}

export class BarcodeService {
    private logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    public async generateBarcode(
        text: string,
        format: BarcodeFormat = 'CODE128',
        options: Partial<BarcodeOptions> = {}
    ): Promise<BarcodeResult> {
        try {
            const barcodeOptions: BarcodeOptions = {
                format,
                width: options.width || parseInt(process.env.BARCODE_DEFAULT_WIDTH || '2'),
                height: options.height || parseInt(process.env.BARCODE_DEFAULT_HEIGHT || '100'),
                text: options.text || text,
                scale: options.scale || 3,
                includetext: options.includetext !== false,
            };

            if (format === 'QRCODE') {
                return await this.generateQRCode(text, barcodeOptions);
            } else {
                return await this.generateLinearBarcode(text, barcodeOptions);
            }
        } catch (error) {
            this.logger.error('Error generating barcode:', error);
            throw error;
        }
    }

    private async generateLinearBarcode(
        text: string,
        options: BarcodeOptions
    ): Promise<BarcodeResult> {
        try {
            const buffer = await bwipjs.toBuffer({
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

            // Buffer is already in the correct format

            return {
                data: buffer,
                format: options.format,
                text: text,
            };
        } catch (error) {
            this.logger.error('Error generating linear barcode:', error);
            throw new Error(`Failed to generate ${options.format} barcode: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async generateQRCode(
        text: string,
        options: BarcodeOptions
    ): Promise<BarcodeResult> {
        try {
            const qrOptions = {
                width: options.width! * 10, // QR codes need more width
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M' as const,
            };

            const buffer = await QRCode.toBuffer(text, qrOptions);

            return {
                data: buffer,
                format: 'QRCODE',
                text: text,
            };
        } catch (error) {
            this.logger.error('Error generating QR code:', error);
            throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async generateBarcodeSVG(
        text: string,
        format: BarcodeFormat = 'CODE128',
        options: Partial<BarcodeOptions> = {}
    ): Promise<string> {
        try {
            const barcodeOptions: BarcodeOptions = {
                format,
                width: options.width || 2,
                height: options.height || 100,
                text: options.text || text,
                scale: options.scale || 3,
                includetext: options.includetext !== false,
            };

            if (format === 'QRCODE') {
                return await QRCode.toString(text, { type: 'svg' });
            } else {
                return await bwipjs.toSVG({
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
        } catch (error) {
            this.logger.error('Error generating barcode SVG:', error);
            throw error;
        }
    }

    public async generateBarcodeDataURL(
        text: string,
        format: BarcodeFormat = 'CODE128',
        options: Partial<BarcodeOptions> = {}
    ): Promise<string> {
        try {
            const barcodeOptions: BarcodeOptions = {
                format,
                width: options.width || 2,
                height: options.height || 100,
                text: options.text || text,
                scale: options.scale || 3,
                includetext: options.includetext !== false,
            };

            if (format === 'QRCODE') {
                return await QRCode.toDataURL(text, {
                    width: barcodeOptions.width! * 10,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });
            } else {
                const buffer = await bwipjs.toBuffer({
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
        } catch (error) {
            this.logger.error('Error generating barcode data URL:', error);
            throw error;
        }
    }

    public validateBarcodeFormat(format: string): format is BarcodeFormat {
        const validFormats: BarcodeFormat[] = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE'];
        return validFormats.includes(format as BarcodeFormat);
    }

    public getSupportedFormats(): BarcodeFormat[] {
        return ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QRCODE'];
    }

    public async generateBarcodeLabel(
        text: string,
        format: BarcodeFormat = 'CODE128',
        labelOptions: {
            productName?: string;
            price?: number;
            sku?: string;
            width?: number;
            height?: number;
        } = {}
    ): Promise<Buffer> {
        try {
            const { productName, price, sku, width = 200, height = 100 } = labelOptions;

            // Generate barcode
            const barcodeResult = await this.generateBarcode(text, format, {
                width: 2,
                height: 50,
                includetext: false,
            });

            // Create a simple label layout
            const buffer = await bwipjs.toBuffer({
                bcid: 'datamatrix', // Use datamatrix for label layout
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
        } catch (error) {
            this.logger.error('Error generating barcode label:', error);
            throw error;
        }
    }

    public async scanBarcode(imageBuffer: Buffer): Promise<string | null> {
        try {
            // This is a placeholder for barcode scanning functionality
            // In a real implementation, you would use a library like 'quagga' or 'zxing'
            // or integrate with a camera API

            this.logger.warn('Barcode scanning not implemented yet. This is a placeholder.');
            return null;
        } catch (error) {
            this.logger.error('Error scanning barcode:', error);
            throw error;
        }
    }
}
