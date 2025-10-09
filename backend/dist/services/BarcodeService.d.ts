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
export declare class BarcodeService {
    private logger;
    constructor();
    generateBarcode(text: string, format?: BarcodeFormat, options?: Partial<BarcodeOptions>): Promise<BarcodeResult>;
    private generateLinearBarcode;
    private generateQRCode;
    generateBarcodeSVG(text: string, format?: BarcodeFormat, options?: Partial<BarcodeOptions>): Promise<string>;
    generateBarcodeDataURL(text: string, format?: BarcodeFormat, options?: Partial<BarcodeOptions>): Promise<string>;
    validateBarcodeFormat(format: string): format is BarcodeFormat;
    getSupportedFormats(): BarcodeFormat[];
    generateBarcodeLabel(text: string, format?: BarcodeFormat, labelOptions?: {
        productName?: string;
        price?: number;
        sku?: string;
        width?: number;
        height?: number;
    }): Promise<Buffer>;
    scanBarcode(imageBuffer: Buffer): Promise<string | null>;
}
//# sourceMappingURL=BarcodeService.d.ts.map