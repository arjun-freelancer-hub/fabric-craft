import { Inventory, InventoryType, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface CreateInventoryData {
  productId: string;
  quantity: number;
  type: InventoryType;
  reference?: string;
  notes?: string;
  createdBy: string;
}

export class InventoryModel extends BaseModel<Inventory> {
  getTableName(): string {
    return 'inventory';
  }

  public async addInventory(data: CreateInventoryData): Promise<Inventory> {
    try {
      const inventory = await this.create(data);
      this.logOperation('CREATE', {
        id: inventory.id,
        productId: inventory.productId,
        quantity: inventory.quantity,
        type: inventory.type
      });
      return inventory;
    } catch (error) {
      this.logger.error('Error adding inventory:', error);
      throw error;
    }
  }

  public async getProductStock(productId: string): Promise<{
    currentStock: number;
    transactions: Array<{
      id: string;
      quantity: number;
      type: InventoryType;
      reference?: string;
      notes?: string;
      createdAt: Date;
    }>;
  }> {
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
    } catch (error) {
      this.logger.error('Error getting product stock:', error);
      throw error;
    }
  }

  public async getInventoryStats(): Promise<{
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
    recentTransactions: number;
  }> {
    try {
      const [
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        recentTransactions,
      ] = await Promise.all([
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
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      // Calculate total inventory value (simplified)
      const totalValue = 0; // This would require more complex calculation

      return {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue,
        recentTransactions,
      };
    } catch (error) {
      this.logger.error('Error getting inventory stats:', error);
      throw error;
    }
  }
}
