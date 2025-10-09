"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModel = void 0;
const BaseModel_1 = require("./BaseModel");
class InventoryModel extends BaseModel_1.BaseModel {
    getTableName() {
        return 'inventory';
    }
    async addInventory(data) {
        try {
            const inventory = await this.create(data);
            this.logOperation('CREATE', {
                id: inventory.id,
                productId: inventory.productId,
                quantity: inventory.quantity,
                type: inventory.type
            });
            return inventory;
        }
        catch (error) {
            this.logger.error('Error adding inventory:', error);
            throw error;
        }
    }
    async getProductStock(productId) {
        try {
            const transactions = await this.prisma.inventory.findMany({
                where: { productId },
                orderBy: { createdAt: 'desc' },
            });
            const currentStock = transactions.reduce((total, transaction) => {
                return total + (transaction.type === 'IN' ? transaction.quantity : -transaction.quantity);
            }, 0);
            return {
                currentStock,
                transactions: transactions.map(t => ({
                    id: t.id,
                    quantity: t.quantity,
                    type: t.type,
                    reference: t.reference || undefined,
                    notes: t.notes || undefined,
                    createdAt: t.createdAt,
                })),
            };
        }
        catch (error) {
            this.logger.error('Error getting product stock:', error);
            throw error;
        }
    }
    async getInventoryStats() {
        try {
            const [totalProducts, lowStockProducts, outOfStockProducts, recentTransactions,] = await Promise.all([
                this.prisma.product.count({ where: { isActive: true } }),
                this.prisma.product.count({
                    where: {
                        isActive: true,
                        minStock: { gt: 0 },
                    },
                }),
                this.prisma.product.count({
                    where: {
                        isActive: true,
                        minStock: { gt: 0 },
                    },
                }),
                this.prisma.inventory.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
            ]);
            const totalValue = 0;
            return {
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                totalValue,
                recentTransactions,
            };
        }
        catch (error) {
            this.logger.error('Error getting inventory stats:', error);
            throw error;
        }
    }
}
exports.InventoryModel = InventoryModel;
//# sourceMappingURL=InventoryModel.js.map