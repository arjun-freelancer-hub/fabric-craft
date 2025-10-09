import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Logger } from './utils/Logger';

const app = express();
const logger = new Logger();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000'],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Mock API endpoints for testing
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
    });
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Mock authentication
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
    } else {
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

// Mock dashboard data
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { details: err.message }),
        },
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
        },
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Backend server running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔗 API base URL: http://localhost:${PORT}/api`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
