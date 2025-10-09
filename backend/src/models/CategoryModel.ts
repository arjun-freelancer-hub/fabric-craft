import { Category, Prisma } from '@prisma/client';
import { BaseModel } from './BaseModel';
import { ErrorHandler } from '@/middleware/ErrorHandler';

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class CategoryModel extends BaseModel<Category> {
  getTableName(): string {
    return 'category';
  }

  public async createCategory(data: CreateCategoryData): Promise<Category> {
    try {
      // Check if category with same name already exists (will be workspace-scoped when organizationId is added)
      const existingCategory = await this.findByName(undefined, data.name);
      if (existingCategory) {
        throw ErrorHandler.createError('Category with this name already exists', 409);
      }

      const category = await this.create(data);
      this.logOperation('CREATE', { id: category.id, name: category.name });
      return category;
    } catch (error) {
      this.logger.error('Error creating category:', error);
      throw error;
    }
  }

  public async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    try {
      // Check if name is being changed and if it already exists (will be workspace-scoped when organizationId is added)
      if (data.name) {
        const existingCategory = await this.findByName(undefined, data.name);
        if (existingCategory && existingCategory.id !== id) {
          throw ErrorHandler.createError('Category with this name already exists', 409);
        }
      }

      const category = await this.update(id, data);
      this.logOperation('UPDATE', { id: category.id, name: category.name });
      return category;
    } catch (error) {
      this.logger.error('Error updating category:', error);
      throw error;
    }
  }

  public async findByName(organizationId: string | undefined, name: string): Promise<Category | null> {
    try {
      if (!organizationId) {
        // Fallback for backward compatibility - find first match
        const category = await this.prisma.category.findFirst({
          where: { name },
        });
        return category;
      }

      const category = await this.prisma.category.findUnique({
        where: {
          organizationId_name: {
            organizationId,
            name,
          },
        },
      });
      return category;
    } catch (error) {
      this.logger.error('Error finding category by name:', error);
      throw error;
    }
  }

  public async getActiveCategories(): Promise<Category[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      return categories;
    } catch (error) {
      this.logger.error('Error getting active categories:', error);
      throw error;
    }
  }

  public async getCategoryStats(): Promise<{
    total: number;
    active: number;
    withProducts: number;
  }> {
    try {
      const [total, active, withProducts] = await Promise.all([
        this.count(),
        this.count({ isActive: true }),
        this.prisma.category.count({
          where: {
            isActive: true,
            products: {
              some: {
                isActive: true,
              },
            },
          },
        }),
      ]);

      return {
        total,
        active,
        withProducts,
      };
    } catch (error) {
      this.logger.error('Error getting category stats:', error);
      throw error;
    }
  }
}
