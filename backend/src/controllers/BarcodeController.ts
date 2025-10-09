import { Request, Response, NextFunction } from 'express';
import { BarcodeService } from '@/services/BarcodeService';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';

export class BarcodeController {
  private barcodeService: BarcodeService;
  private logger: Logger;

  constructor() {
    this.barcodeService = new BarcodeService();
    this.logger = new Logger();
  }

  public async generateBarcode(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  public async generateBarcodeSVG(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  public async generateBarcodeDataURL(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  public async generateBarcodeLabel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        generatedBy: req.user!.id,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="barcode-label-${text}.png"`);
      res.send(labelBuffer);
    } catch (error) {
      next(error);
    }
  }

  public async getSupportedFormats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const formats = this.barcodeService.getSupportedFormats();

      res.status(200).json({
        success: true,
        data: { formats },
      });
    } catch (error) {
      next(error);
    }
  }

  public async scanBarcode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image } = req.body;

      const result = await this.barcodeService.scanBarcode(Buffer.from(image, 'base64'));

      this.logger.info('Barcode scanned successfully', {
        result,
        scannedBy: req.user!.id,
      });

      res.status(200).json({
        success: true,
        data: { barcode: result },
      });
    } catch (error) {
      next(error);
    }
  }
}
