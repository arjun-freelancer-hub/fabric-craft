#!/bin/bash

echo "🚀 Setting up Clothing Store Billing & Inventory System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ first."
    exit 1
fi

echo "✅ MySQL is installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please edit backend/.env with your database credentials"
else
    echo "✅ backend/.env already exists"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/env.local.example frontend/.env.local
    echo "✅ Created frontend/.env.local from template"
else
    echo "✅ frontend/.env.local already exists"
fi

# Database setup
echo "🗄️  Setting up database..."

# Check if database exists
DB_NAME="clothing_store"
DB_EXISTS=$(mysql -u root -p -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='$DB_NAME';" 2>/dev/null | grep -c "$DB_NAME")

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "Creating database '$DB_NAME'..."
    mysql -u root -p -e "CREATE DATABASE $DB_NAME;"
    echo "✅ Database created"
else
    echo "✅ Database already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate

# Push database schema
echo "📊 Pushing database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Edit frontend/.env.local if needed"
echo "3. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "👤 Default admin credentials:"
echo "   Email:    admin@clothingstore.com"
echo "   Password: Admin123!"
echo ""
echo "📚 Documentation:"
echo "   - Installation Guide: docs/INSTALLATION.md"
echo "   - Usage Guide: docs/USAGE_GUIDE.md"
echo "   - API Documentation: docs/API_DOCUMENTATION.md"
echo ""
