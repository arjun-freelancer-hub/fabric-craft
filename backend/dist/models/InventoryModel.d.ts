import { Inventory, InventoryType } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateInventoryData {
    productId: string;
    quantity: number;
    type: InventoryType;
    reference?: string;
    notes?: string;
    createdBy: string;
}
export declare class InventoryModel extends BaseModel<Inventory> {
    getTableName(): string;
    addInventory(data: CreateInventoryData): Promise<Inventory>;
    getProductStock(productId: string): Promise<{
        currentStock: number;
        transactions: Array<{
            id: string;
            quantity: number;
            type: InventoryType;
            reference?: string;
            notes?: string;
            createdAt: Date;
        }>;
    }>;
    getInventoryStats(): Promise<{
        totalProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        totalValue: number;
        recentTransactions: number;
    }>;
}
//# sourceMappingURL=InventoryModel.d.ts.map