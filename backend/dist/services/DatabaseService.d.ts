import { PrismaClient } from '@prisma/client';
export declare class DatabaseService {
    private static instance;
    private prisma;
    private logger;
    private isConnected;
    private dbInitializer;
    private constructor();
    private setupEventListeners;
    private runMigrations;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): PrismaClient;
    healthCheck(): Promise<boolean>;
    transaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T>;
    executeRaw<T = any>(query: string, ...params: any[]): Promise<T>;
    static getInstance(): DatabaseService;
}
//# sourceMappingURL=DatabaseService.d.ts.map