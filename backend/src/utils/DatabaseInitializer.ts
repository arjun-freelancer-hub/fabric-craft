import mysql from 'mysql2/promise';
import { Logger } from '@/utils/Logger';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseInitializer {
    private logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    /**
     * Extract database name from DATABASE_URL
     */
    private extractDbConfig(): { host: string; port: number; user: string; password: string; database: string } {
        const dbUrl = process.env.DATABASE_URL || '';

        // Parse DATABASE_URL: mysql://user:password@host:port/database
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

        if (!match) {
            // Fallback to individual env variables
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

    /**
     * Check if database exists and create it if it doesn't
     */
    public async initializeDatabase(): Promise<void> {
        const config = this.extractDbConfig();
        let connection;

        try {
            this.logger.info('Checking database existence...');

            // Connect to MySQL server without specifying database
            connection = await mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
            });

            // Check if database exists
            const [rows] = await connection.query(
                'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
                [config.database]
            );

            if (Array.isArray(rows) && rows.length === 0) {
                // Database doesn't exist, create it
                this.logger.info(`Database '${config.database}' does not exist. Creating...`);
                await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                this.logger.info(`✅ Database '${config.database}' created successfully!`);
            } else {
                this.logger.info(`✅ Database '${config.database}' already exists.`);
            }

            await connection.end();
        } catch (error: any) {
            this.logger.error('Failed to initialize database:', error);

            // Provide helpful error messages
            if (error.code === 'ECONNREFUSED') {
                this.logger.error(`❌ Cannot connect to MySQL server at ${config.host}:${config.port}`);
                this.logger.error('   Please ensure MySQL server is running.');
                this.logger.error('   On Linux: sudo systemctl start mysql');
                this.logger.error('   On Mac: brew services start mysql');
                this.logger.error('   On Windows: net start MySQL');
            } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                this.logger.error(`❌ Access denied for user '${config.user}'`);
                this.logger.error('   Please check your database credentials in .env file');
            } else {
                this.logger.error(`❌ Database initialization error: ${error.message}`);
            }

            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (err) {
                    // Ignore connection close errors
                }
            }
        }
    }

    /**
     * Verify database connection
     */
    public async verifyConnection(): Promise<boolean> {
        const config = this.extractDbConfig();
        let connection;

        try {
            connection = await mysql.createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database,
            });

            await connection.query('SELECT 1');
            await connection.end();
            return true;
        } catch (error) {
            this.logger.error('Database connection verification failed:', error);
            return false;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (err) {
                    // Ignore connection close errors
                }
            }
        }
    }
}

