# Installation Guide

This guide will help you set up the Clothing Store Billing & Inventory System on your local machine or production server.

## Prerequisites

Before installing the system, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0 or higher) or **MariaDB** (v10.6 or higher)
- **Git** (for cloning the repository)
- **Docker** (optional, for containerized deployment)

## Quick Start with Docker

The easiest way to get started is using Docker Compose:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd clothing-store-billing-system
```

### 2. Environment Setup

```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit the environment files with your configuration
nano backend/.env
nano frontend/.env.local
```

### 3. Start with Docker

```bash
# Start all services
docker-compose up -d

# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MySQL: localhost:3306

## Manual Installation

### 1. Clone and Setup

```bash
git clone <repository-url>
cd clothing-store-billing-system

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Create Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE clothing_store;

-- Create user (optional)
CREATE USER 'clothing_store_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON clothing_store.* TO 'clothing_store_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Run Database Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 3. Environment Configuration

#### Backend Environment (.env)

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=clothing_store
DB_USER=clothing_store_user
DB_PASSWORD=your_password
DATABASE_URL="mysql://clothing_store_user:your_password@localhost:3306/clothing_store"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WhatsApp Integration (Optional)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your_whatsapp_business_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Payment Gateway (Optional)
PAYMENT_GATEWAY_URL=https://api.payment-gateway.com
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
PAYMENT_GATEWAY_SECRET=your_payment_gateway_secret

# Barcode Configuration
BARCODE_DEFAULT_FORMAT=CODE128
BARCODE_DEFAULT_WIDTH=2
BARCODE_DEFAULT_HEIGHT=100

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

#### Frontend Environment (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Clothing Store
```

### 4. Start Development Servers

#### Option 1: Start Both Services

```bash
# From root directory
npm run dev
```

#### Option 2: Start Services Separately

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Verify Installation

1. **Backend Health Check**: Visit http://localhost:5000/health
2. **Frontend**: Visit http://localhost:3000
3. **Database**: Check if tables are created in your MySQL database

## Production Deployment

### 1. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### 2. Production Environment

Update your environment variables for production:

```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### 3. Deploy with Docker

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Nginx Configuration (Optional)

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check database credentials
mysql -u clothing_store_user -p clothing_store
```

#### 2. Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### 3. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/project
chmod -R 755 /path/to/project
```

#### 4. Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Logs

#### Backend Logs

```bash
# Development
cd backend
npm run dev

# Production
tail -f logs/app.log
```

#### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **Use Strong JWT Secrets**: Generate strong, random JWT secrets
3. **Enable HTTPS**: Use SSL certificates in production
4. **Database Security**: Use strong database passwords and limit access
5. **Environment Variables**: Never commit sensitive data to version control

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Caching**: Enable Redis for session and data caching
3. **CDN**: Use a CDN for static assets in production
4. **Load Balancing**: Use multiple backend instances for high traffic

## Backup and Recovery

### Database Backup

```bash
# Create backup
mysqldump -u clothing_store_user -p clothing_store > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u clothing_store_user -p clothing_store < backup_file.sql
```

### File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/

# Backup logs
tar -czf logs_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/logs/
```

## Support

If you encounter any issues during installation:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment configuration
5. Create an issue in the repository with detailed error information

## Next Steps

After successful installation:

1. Create your first admin user
2. Set up product categories
3. Add your first products
4. Configure barcode settings
5. Set up WhatsApp integration (optional)
6. Configure payment gateways (optional)
7. Review the user guide for system usage
