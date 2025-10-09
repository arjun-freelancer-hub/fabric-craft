import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '@/services/DatabaseService';
import { Logger } from '@/utils/Logger';

export abstract class BaseModel<T> {
    protected logger: Logger;
    protected databaseService: DatabaseService;

    constructor() {
        this.databaseService = DatabaseService.getInstance();
        this.logger = new Logger();
    }

    protected get prisma(): PrismaClient {
        return this.databaseService.getClient();
    }

    abstract getTableName(): string;

    public async findById(id: string): Promise<T | null> {
        try {
            const result = await (this.prisma as any)[this.getTableName()].findUnique({
                where: { id },
            });
            return result;
        } catch (error) {
            this.logger.error(`Error finding ${this.getTableName()} by ID:`, error);
            throw error;
        }
    }

    public async findMany(
        where: any = {},
        options: {
            skip?: number;
            take?: number;
            orderBy?: any;
            include?: any;
        } = {}
    ): Promise<{ data: T[]; total: number }> {
        try {
            const [data, total] = await Promise.all([
                (this.prisma as any)[this.getTableName()].findMany({
                    where,
                    ...options,
                }),
                (this.prisma as any)[this.getTableName()].count({ where }),
            ]);

            return { data, total };
        } catch (error) {
            this.logger.error(`Error finding ${this.getTableName()} records:`, error);
            throw error;
        }
    }

    public async create(data: any): Promise<T> {
        try {
            const result = await (this.prisma as any)[this.getTableName()].create({
                data,
            });
            return result;
        } catch (error) {
            this.logger.error(`Error creating ${this.getTableName()}:`, error);
            throw error;
        }
    }

    public async update(id: string, data: any): Promise<T> {
        try {
            const result = await (this.prisma as any)[this.getTableName()].update({
                where: { id },
                data,
            });
            return result;
        } catch (error) {
            this.logger.error(`Error updating ${this.getTableName()}:`, error);
            throw error;
        }
    }

    public async delete(id: string): Promise<T> {
        try {
            const result = await (this.prisma as any)[this.getTableName()].delete({
                where: { id },
            });
            return result;
        } catch (error) {
            this.logger.error(`Error deleting ${this.getTableName()}:`, error);
            throw error;
        }
    }

    public async softDelete(id: string): Promise<T> {
        try {
            const result = await (this.prisma as any)[this.getTableName()].update({
                where: { id },
                data: { isActive: false },
            });
            return result;
        } catch (error) {
            this.logger.error(`Error soft deleting ${this.getTableName()}:`, error);
            throw error;
        }
    }

    public async exists(id: string): Promise<boolean> {
        try {
            const count = await (this.prisma as any)[this.getTableName()].count({
                where: { id },
            });
            return count > 0;
        } catch (error) {
            this.logger.error(`Error checking ${this.getTableName()} existence:`, error);
            throw error;
        }
    }

    public async count(where: any = {}): Promise<number> {
        try {
            return await (this.prisma as any)[this.getTableName()].count({ where });
        } catch (error) {
            this.logger.error(`Error counting ${this.getTableName()}:`, error);
            throw error;
        }
    }

    protected async executeTransaction<T>(
        fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
    ): Promise<T> {
        return await this.prisma.$transaction(fn);
    }

    protected logOperation(operation: string, data: any): void {
        this.logger.info(`${this.getTableName()} ${operation}:`, {
            operation,
            data: typeof data === 'object' ? JSON.stringify(data) : data,
        });
    }
}
