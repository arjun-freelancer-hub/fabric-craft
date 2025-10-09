"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const InventoryModel_1 = require("@/models/InventoryModel");
const Logger_1 = require("@/utils/Logger");
class InventoryController {
    constructor() {
        this.inventoryModel = new InventoryModel_1.InventoryModel();
        this.logger = new Logger_1.Logger();
    }
    async getInventory(req, res, next) {
        try {
            const { productId, type } = req.query;
            const pagination = req.pagination;
            let where = {};
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
        }
        catch (error) {
            next(error);
        }
    }
    async addInventory(req, res, next) {
        try {
            const inventoryData = {
                ...req.body,
                createdBy: req.user.id,
            };
            const inventory = await this.inventoryModel.addInventory(inventoryData);
            this.logger.info('Inventory added successfully', {
                inventoryId: inventory.id,
                productId: inventory.productId,
                quantity: inventory.quantity,
                type: inventory.type,
                addedBy: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: { inventory },
                message: 'Inventory added successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductStock(req, res, next) {
        try {
            const { productId } = req.params;
            const stock = await this.inventoryModel.getProductStock(productId);
            res.status(200).json({
                success: true,
                data: { stock },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getInventoryStats(req, res, next) {
        try {
            const stats = await this.inventoryModel.getInventoryStats();
            res.status(200).json({
                success: true,
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InventoryController = InventoryController;
//# sourceMappingURL=InventoryController.js.map