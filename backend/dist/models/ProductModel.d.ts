import { Product, ProductType } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateProductData {
    name: string;
    description?: string;
    sku: string;
    categoryId: string;
    type: ProductType;
    unit: string;
    basePrice: number;
    sellingPrice: number;
    costPrice: number;
    minStock?: number;
    maxStock?: number;
    isTailoring?: boolean;
    tailoringPrice?: number;
    imageUrl?: string;
    specifications?: any;
    createdBy: string;
}
export interface UpdateProductData {
    name?: string;
    description?: string;
    categoryId?: string;
    type?: ProductType;
    unit?: string;
    basePrice?: number;
    sellingPrice?: number;
    costPrice?: number;
    minStock?: number;
    maxStock?: number;
    isTailoring?: boolean;
    tailoringPrice?: number;
    imageUrl?: string;
    specifications?: any;
    isActive?: boolean;
}
export interface ProductWithCategory extends Product {
    category: {
        id: string;
        name: string;
    };
    inventory?: {
        quantity: number;
    }[];
}
export declare class ProductModel extends BaseModel<Product> {
    private barcodeService;
    constructor();
    getTableName(): string;
    createProduct(data: CreateProductData): Promise<Product>;
    updateProduct(id: string, data: UpdateProductData): Promise<Product>;
    findBySku(organizationId: string | undefined, sku: string): Promise<Product | null>;
    findByBarcode(organizationId: string | undefined, barcode: string): Promise<Product | null>;
    getProductsWithCategory(where?: any, options?: {
        skip?: number;
        take?: number;
        orderBy?: any;
    }): Promise<{
        data: ProductWithCategory[];
        total: number;
    }>;
    getProductsByCategory(categoryId: string): Promise<Product[]>;
    getProductsByType(type: ProductType): Promise<Product[]>;
    getLowStockProducts(): Promise<Product[]>;
    searchProducts(query: string, filters?: {
        categoryId?: string;
        type?: ProductType;
        isActive?: boolean;
    }, limit?: number): Promise<Product[]>;
    getProductStats(): Promise<{
        total: number;
        active: number;
        byType: Record<ProductType, number>;
        byCategory: Array<{
            categoryName: string;
            count: number;
        }>;
    }>;
    regenerateBarcode(id: string): Promise<Product>;
}
//# sourceMappingURL=ProductModel.d.ts.map