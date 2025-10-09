import { PrismaClient } from '@prisma/client';
import { DatabaseService } from '@/services/DatabaseService';
import { Logger } from '@/utils/Logger';
export declare abstract class BaseModel<T> {
    protected logger: Logger;
    protected databaseService: DatabaseService;
    constructor();
    protected get prisma(): PrismaClient;
    abstract getTableName(): string;
    findById(id: string): Promise<T | null>;
    findMany(where?: any, options?: {
        skip?: number;
        take?: number;
        orderBy?: any;
        include?: any;
    }): Promise<{
        data: T[];
        total: number;
    }>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T>;
    delete(id: string): Promise<T>;
    softDelete(id: string): Promise<T>;
    exists(id: string): Promise<boolean>;
    count(where?: any): Promise<number>;
    protected executeTransaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T>;
    protected logOperation(operation: string, data: any): void;
}
//# sourceMappingURL=BaseModel.d.ts.map