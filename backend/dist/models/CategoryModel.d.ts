import { Category } from '@prisma/client';
import { BaseModel } from './BaseModel';
export interface CreateCategoryData {
    name: string;
    description?: string;
}
export interface UpdateCategoryData {
    name?: string;
    description?: string;
    isActive?: boolean;
}
export declare class CategoryModel extends BaseModel<Category> {
    getTableName(): string;
    createCategory(data: CreateCategoryData): Promise<Category>;
    updateCategory(id: string, data: UpdateCategoryData): Promise<Category>;
    findByName(organizationId: string | undefined, name: string): Promise<Category | null>;
    getActiveCategories(): Promise<Category[]>;
    getCategoryStats(): Promise<{
        total: number;
        active: number;
        withProducts: number;
    }>;
}
//# sourceMappingURL=CategoryModel.d.ts.map