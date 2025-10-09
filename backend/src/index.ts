import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { DatabaseService } from '@/services/DatabaseService';
import { ErrorHandler } from '@/middleware/ErrorHandler';
import { Logger } from '@/utils/Logger';
import { AppRoutes } from '@/routes/AppRoutes';

// Load environment variables
dotenv.config();

class App {
    private app: express.Application;
    private port: number;
    private databaseService: DatabaseService;
    private logger: Logger;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || '5000', 10);
        this.databaseService = DatabaseService.getInstance();
        this.logger = new Logger();

        this.initializeMiddlewares();
    }

    private initializeMiddlewares(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production'
                ? process.env.FRONTEND_URL
                : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Organization-Id', 'Cookie'],
            exposedHeaders: ['Set-Cookie'],
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
            message: {
                error: 'Too many requests from this IP, please try again later.',
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        // Compression
        this.app.use(compression());

        // Logging
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('combined', {
                stream: {
                    write: (message: string) => this.logger.info(message.trim()),
                },
            }));
        }

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Static files
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    }

    private initializeRoutes(): void {
        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
            });
        });

        // API routes
        this.app.use('/api', new AppRoutes().getRouter());
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
            });
        });

        // Global error handler
        this.app.use(ErrorHandler.handle);
    }

    public async start(): Promise<void> {
        try {
            // Connect to database
            await this.databaseService.connect();
            this.logger.info('Database connected successfully');

            // Initialize routes after database connection
            this.logger.info('Initializing routes...');
            this.initializeRoutes();
            this.logger.info('Routes initialized successfully');

            // Initialize error handling after routes
            this.initializeErrorHandling();

            // Start server
            await new Promise<void>((resolve, reject) => {
                const server = this.app.listen(this.port, () => {
                    this.logger.info(`🚀 Backend server running on port ${this.port}`);
                    this.logger.info(`📊 Health check: http://localhost:${this.port}/health`);
                    this.logger.info(`🔗 API base URL: http://localhost:${this.port}/api`);
                    this.logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
                    resolve();
                });

                server.on('error', (error) => {
                    this.logger.error('Server error:', error);
                    reject(error);
                });
            });
        } catch (error) {
            this.logger.error('Failed to start server:', error);
            if (error instanceof Error) {
                this.logger.error('Error details:', error.message);
                this.logger.error('Error stack:', error.stack);
            }
            process.exit(1);
        }
    }

    public async stop(): Promise<void> {
        try {
            await this.databaseService.disconnect();
            this.logger.info('Server stopped gracefully');
        } catch (error) {
            this.logger.error('Error stopping server:', error);
        }
    }

    public getApp(): express.Application {
        return this.app;
    }
}

// Create and start the application
const app = new App();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await app.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await app.stop();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
if (require.main === module) {
    app.start().catch((error) => {
        console.error('Failed to start application:', error);
        process.exit(1);
    });
}

export default app;
