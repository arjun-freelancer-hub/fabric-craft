import { PrismaClient } from '@prisma/client';
import { Logger } from '@/utils/Logger';
import { DatabaseInitializer } from '@/utils/DatabaseInitializer';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class DatabaseService {
    private static instance: DatabaseService;
    private prisma: PrismaClient;
    private logger: Logger;
    private isConnected: boolean = false;
    private dbInitializer: DatabaseInitializer;

    private constructor() {
        this.logger = new Logger();
        this.dbInitializer = new DatabaseInitializer();
        this.prisma = new PrismaClient({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Event listeners are not available in the current Prisma version
        // Logging is handled through the log configuration in the constructor
    }

    /**
     * Run Prisma migrations to create/update database schema
     */
    private async runMigrations(): Promise<void> {
        try {
            this.logger.info('🔄 Running database migrations...');

            // Use prisma db push for development (creates tables without migration files)
            // In Docker, __dirname will be /app/dist, so we need to go up one level to /app
            // In development, __dirname will be dist, so we go up to backend root
            const backendPath = path.resolve(__dirname, '../..');
            const prismaPath = path.join(backendPath, 'prisma', 'schema.prisma');

            // Verify Prisma schema exists
            if (!fs.existsSync(prismaPath)) {
                // Try alternative path (for Docker where we're in /app)
                const altPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
                if (fs.existsSync(altPath)) {
                    this.logger.info(`Using Prisma schema at: ${altPath}`);
                } else {
                    this.logger.warn(`Prisma schema not found at ${prismaPath} or ${altPath}, attempting to continue...`);
                }
            }

            const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate', {
                cwd: backendPath,
                env: { ...process.env }
            });

            if (stdout) {
                this.logger.info(stdout.trim());
            }
            if (stderr && !stderr.includes('warn')) {
                this.logger.warn(stderr.trim());
            }

            this.logger.info('✅ Database schema synchronized successfully!');
        } catch (error: any) {
            this.logger.error('❌ Failed to run migrations:', error.message);
            throw error;
        }
    }

    public async connect(): Promise<void> {
        try {
            // Initialize database (create if not exists)
            await this.dbInitializer.initializeDatabase();

            // Run migrations to create/update tables
            await this.runMigrations();

            // Connect to database with Prisma
            await this.prisma.$connect();
            this.isConnected = true;
            this.logger.info('✅ Database connected successfully');
        } catch (error: any) {
            this.logger.error('❌ Failed to connect to database:', error);

            // Provide user-friendly error messages
            if (error.code === 'P1003') {
                this.logger.error('💡 Tip: Database might not exist. The system will try to create it automatically.');
            }

            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.prisma.$disconnect();
            this.isConnected = false;
            this.logger.info('Database disconnected successfully');
        } catch (error) {
            this.logger.error('Failed to disconnect from database:', error);
            throw error;
        }
    }

    public getClient(): PrismaClient {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.prisma;
    }

    public async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }

    public async transaction<T>(
        fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
    ): Promise<T> {
        return await this.prisma.$transaction(fn);
    }

    public async executeRaw<T = any>(query: string, ...params: any[]): Promise<T> {
        return await this.prisma.$queryRawUnsafe(query, ...params);
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
}
