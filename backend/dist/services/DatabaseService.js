"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const client_1 = require("@prisma/client");
const Logger_1 = require("@/utils/Logger");
const DatabaseInitializer_1 = require("@/utils/DatabaseInitializer");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class DatabaseService {
    constructor() {
        this.isConnected = false;
        this.logger = new Logger_1.Logger();
        this.dbInitializer = new DatabaseInitializer_1.DatabaseInitializer();
        this.prisma = new client_1.PrismaClient({
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
    setupEventListeners() {
    }
    async runMigrations() {
        try {
            this.logger.info('🔄 Running database migrations...');
            const backendPath = path_1.default.resolve(__dirname, '../..');
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
        }
        catch (error) {
            this.logger.error('❌ Failed to run migrations:', error.message);
            throw error;
        }
    }
    async connect() {
        try {
            await this.dbInitializer.initializeDatabase();
            await this.runMigrations();
            await this.prisma.$connect();
            this.isConnected = true;
            this.logger.info('✅ Database connected successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to database:', error);
            if (error.code === 'P1003') {
                this.logger.error('💡 Tip: Database might not exist. The system will try to create it automatically.');
            }
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.isConnected = false;
            this.logger.info('Database disconnected successfully');
        }
        catch (error) {
            this.logger.error('Failed to disconnect from database:', error);
            throw error;
        }
    }
    getClient() {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.prisma;
    }
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }
    async transaction(fn) {
        return await this.prisma.$transaction(fn);
    }
    async executeRaw(query, ...params) {
        return await this.prisma.$queryRawUnsafe(query, ...params);
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map