"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const DatabaseService_1 = require("@/services/DatabaseService");
const ErrorHandler_1 = require("@/middleware/ErrorHandler");
const Logger_1 = require("@/utils/Logger");
const AppRoutes_1 = require("@/routes/AppRoutes");
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '5000', 10);
        this.databaseService = DatabaseService_1.DatabaseService.getInstance();
        this.logger = new Logger_1.Logger();
        this.initializeMiddlewares();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.NODE_ENV === 'production'
                ? process.env.FRONTEND_URL
                : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Organization-Id', 'Cookie'],
            exposedHeaders: ['Set-Cookie'],
        }));
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
            message: {
                error: 'Too many requests from this IP, please try again later.',
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        this.app.use((0, compression_1.default)());
        if (process.env.NODE_ENV !== 'test') {
            this.app.use((0, morgan_1.default)('combined', {
                stream: {
                    write: (message) => this.logger.info(message.trim()),
                },
            }));
        }
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
            });
        });
        this.app.use('/api', new AppRoutes_1.AppRoutes().getRouter());
    }
    initializeErrorHandling() {
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
            });
        });
        this.app.use(ErrorHandler_1.ErrorHandler.handle);
    }
    async start() {
        try {
            await this.databaseService.connect();
            this.logger.info('Database connected successfully');
            this.logger.info('Initializing routes...');
            this.initializeRoutes();
            this.logger.info('Routes initialized successfully');
            this.initializeErrorHandling();
            await new Promise((resolve, reject) => {
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
        }
        catch (error) {
            this.logger.error('Failed to start server:', error);
            if (error instanceof Error) {
                this.logger.error('Error details:', error.message);
                this.logger.error('Error stack:', error.stack);
            }
            process.exit(1);
        }
    }
    async stop() {
        try {
            await this.databaseService.disconnect();
            this.logger.info('Server stopped gracefully');
        }
        catch (error) {
            this.logger.error('Error stopping server:', error);
        }
    }
    getApp() {
        return this.app;
    }
}
const app = new App();
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
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
if (require.main === module) {
    app.start().catch((error) => {
        console.error('Failed to start application:', error);
        process.exit(1);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map