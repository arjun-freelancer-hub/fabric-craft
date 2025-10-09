"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Logger_1 = require("./utils/Logger");
const app = (0, express_1.default)();
const logger = new Logger_1.Logger();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
    });
});
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@clothingstore.com' && password === 'Admin123!') {
        res.json({
            success: true,
            data: {
                user: {
                    id: '1',
                    email: 'admin@clothingstore.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN',
                },
                token: 'mock-jwt-token',
            },
            message: 'Login successful',
        });
    }
    else {
        res.status(401).json({
            success: false,
            error: {
                message: 'Invalid credentials',
            },
        });
    }
});
app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: '2',
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: 'STAFF',
            },
            token: 'mock-jwt-token',
        },
        message: 'Registration successful',
    });
});
app.get('/api/dashboard/overview', (req, res) => {
    res.json({
        success: true,
        data: {
            dashboard: {
                sales: {
                    today: 8500,
                    thisWeek: 45000,
                    thisMonth: 125000,
                    growth: 12.5,
                },
                customers: {
                    total: 250,
                    new: 15,
                    active: 180,
                },
                inventory: {
                    totalProducts: 150,
                    lowStock: 12,
                    outOfStock: 3,
                },
                recentActivity: [
                    { type: 'bill', description: 'New bill #CS241201001 created', time: '2 minutes ago' },
                    { type: 'customer', description: 'New customer John Doe registered', time: '15 minutes ago' },
                    { type: 'product', description: 'Product "Cotton Shirt" stock updated', time: '1 hour ago' },
                ],
                topProducts: [
                    { name: 'Cotton Shirt', sales: 45 },
                    { name: 'Denim Jeans', sales: 35 },
                    { name: 'Summer Dress', sales: 30 },
                ],
            },
        },
    });
});
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { details: err.message }),
        },
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
        },
    });
});
app.listen(PORT, () => {
    logger.info(`🚀 Backend server running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔗 API base URL: http://localhost:${PORT}/api`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
//# sourceMappingURL=index-simple.js.map