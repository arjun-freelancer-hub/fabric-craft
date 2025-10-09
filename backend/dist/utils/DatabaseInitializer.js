"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInitializer = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const Logger_1 = require("@/utils/Logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class DatabaseInitializer {
    constructor() {
        this.logger = new Logger_1.Logger();
    }
    extractDbConfig() {
        const dbUrl = process.env.DATABASE_URL || '';
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!match) {
            return {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306', 10),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'clothing_store',
            };
        }
        return {
            user: match[1],
            password: match[2],
            host: match[3],
            port: parseInt(match[4], 10),
            database: match[5],
        };
    }
    async initializeDatabase() {
        const config = this.extractDbConfig();
        let connection;
        try {
            this.logger.info('Checking database existence...');
            connection = await promise_1.default.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
            });
            const [rows] = await connection.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', [config.database]);
            if (Array.isArray(rows) && rows.length === 0) {
                this.logger.info(`Database '${config.database}' does not exist. Creating...`);
                await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                this.logger.info(`✅ Database '${config.database}' created successfully!`);
            }
            else {
                this.logger.info(`✅ Database '${config.database}' already exists.`);
            }
            await connection.end();
        }
        catch (error) {
            this.logger.error('Failed to initialize database:', error);
            if (error.code === 'ECONNREFUSED') {
                this.logger.error(`❌ Cannot connect to MySQL server at ${config.host}:${config.port}`);
                this.logger.error('   Please ensure MySQL server is running.');
                this.logger.error('   On Linux: sudo systemctl start mysql');
                this.logger.error('   On Mac: brew services start mysql');
                this.logger.error('   On Windows: net start MySQL');
            }
            else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                this.logger.error(`❌ Access denied for user '${config.user}'`);
                this.logger.error('   Please check your database credentials in .env file');
            }
            else {
                this.logger.error(`❌ Database initialization error: ${error.message}`);
            }
            throw error;
        }
        finally {
            if (connection) {
                try {
                    await connection.end();
                }
                catch (err) {
                }
            }
        }
    }
    async verifyConnection() {
        const config = this.extractDbConfig();
        let connection;
        try {
            connection = await promise_1.default.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database,
            });
            await connection.query('SELECT 1');
            await connection.end();
            return true;
        }
        catch (error) {
            this.logger.error('Database connection verification failed:', error);
            return false;
        }
        finally {
            if (connection) {
                try {
                    await connection.end();
                }
                catch (err) {
                }
            }
        }
    }
}
exports.DatabaseInitializer = DatabaseInitializer;
//# sourceMappingURL=DatabaseInitializer.js.map