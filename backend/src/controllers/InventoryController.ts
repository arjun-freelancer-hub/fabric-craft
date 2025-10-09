import { Request, Response, NextFunction } from 'express';
import { InventoryModel } from '@/models/InventoryModel';
import { AuthenticatedRequest } from '@/middleware/AuthMiddleware';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';

export class InventoryController {
  private inventoryModel: InventoryModel;
  private logger: Logger;

  constructor() {
    this.inventoryModel = new InventoryModel();
    this.logger = new Logger();
  }

  public async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, type } = req.query;
      const pagination = (req as any).pagination;

      let where: any = {};

      if (productId) {
        where.productId = productId;
      }

      if (type) {
        where.type = type;
      }

      const { data, total } = await this.inventoryModel.findMany(where, {
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          inventory: data,
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

  public async addInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inventoryData = {
        ...req.body,
        createdBy: req.user!.id,
      };

      const inventory = await this.inventoryModel.addInventory(inventoryData);

      this.logger.info('Inventory added successfully', {
        inventoryId: inventory.id,
        productId: inventory.productId,
        quantity: inventory.quantity,
        type: inventory.type,
        addedBy: req.user!.id,
      });

      res.status(201).json({
        success: true,
        data: { inventory },
        message: 'Inventory added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProductStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const stock = await this.inventoryModel.getProductStock(productId);

      res.status(200).json({
        success: true,
        data: { stock },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.inventoryModel.getInventoryStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}
