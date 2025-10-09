#!/bin/bash

echo "🔧 Fixing setup issues..."
echo "========================="

# Fix frontend dependencies
echo "📦 Installing missing frontend dependencies..."
cd frontend
npm install @radix-ui/react-dialog
cd ..

# Fix backend environment
echo "⚙️  Setting up backend environment..."
cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
fi

# Update .env with empty password for local development
sed -i 's/DB_PASSWORD=your_password/DB_PASSWORD=/' .env
sed -i 's/DATABASE_URL="mysql:\/\/root:your_password@localhost:3306\/clothing_store"/DATABASE_URL="mysql:\/\/root:@localhost:3306\/clothing_store"/' .env

echo "✅ Updated .env file with local database settings"

# Fix seed file TypeScript issues
echo "🔧 Fixing seed file TypeScript issues..."

# Create a temporary seed file with proper types
cat > prisma/seed-fixed.ts << 'EOF'
import { PrismaClient, ProductType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clothingstore.com' },
    update: {},
    create: {
      email: 'admin@clothingstore.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create categories
  const categories = [
    { name: 'Shirts', description: 'All types of shirts' },
    { name: 'Pants', description: 'Trousers and pants' },
    { name: 'Dresses', description: 'Women dresses' },
    { name: 'Fabrics', description: 'Raw fabrics for tailoring' },
    { name: 'Accessories', description: 'Belts, scarves, and other accessories' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  // Get category IDs
  const shirtCategory = await prisma.category.findUnique({ where: { name: 'Shirts' } });
  const fabricCategory = await prisma.category.findUnique({ where: { name: 'Fabrics' } });
  const pantsCategory = await prisma.category.findUnique({ where: { name: 'Pants' } });

  // Create sample products
  const products = [
    {
      name: 'Cotton Shirt',
      sku: 'SHIRT-001',
      barcode: '123456789012',
      categoryId: shirtCategory!.id,
      type: ProductType.READY_MADE,
      unit: 'piece',
      basePrice: 500,
      sellingPrice: 800,
      costPrice: 400,
      minStock: 10,
      maxStock: 100,
      isActive: true,
      isTailoring: false,
      createdBy: adminUser.id,
    },
    {
      name: 'Cotton Fabric',
      sku: 'FABRIC-001',
      barcode: '123456789013',
      categoryId: fabricCategory!.id,
      type: ProductType.FABRIC,
      unit: 'meter',
      basePrice: 200,
      sellingPrice: 300,
      costPrice: 150,
      minStock: 50,
      maxStock: 500,
      isActive: true,
      isTailoring: true,
      tailoringPrice: 500,
      createdBy: adminUser.id,
    },
    {
      name: 'Denim Jeans',
      sku: 'JEANS-001',
      barcode: '123456789014',
      categoryId: pantsCategory!.id,
      type: ProductType.READY_MADE,
      unit: 'piece',
      basePrice: 800,
      sellingPrice: 1200,
      costPrice: 600,
      minStock: 5,
      maxStock: 50,
      isActive: true,
      isTailoring: false,
      createdBy: adminUser.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('✅ Sample products created');

  // Create sample customers
  const customers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '9876543210',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '9876543211',
      address: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      isActive: true,
      createdBy: adminUser.id,
    },
  ];

  for (const customer of customers) {
    await prisma.customer.create({
      data: customer,
    });
  }

  console.log('✅ Sample customers created');

  // Add initial inventory
  const productsList = await prisma.product.findMany();
  
  for (const product of productsList) {
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: product.maxStock || 100,
        type: 'IN',
        reference: 'Initial Stock',
        notes: 'Initial inventory setup',
        createdBy: adminUser.id,
      },
    });
  }

  console.log('✅ Initial inventory added');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Replace the original seed file
mv prisma/seed-fixed.ts prisma/seed.ts

echo "✅ Fixed seed file TypeScript issues"

# Try to set up database without password
echo "🗄️  Setting up database..."

# Check if we can connect to MySQL without password
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL connection successful (no password required)"
    
    # Create database if it doesn't exist
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS clothing_store;" 2>/dev/null
    echo "✅ Database 'clothing_store' ready"
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    echo "📊 Pushing database schema..."
    npx prisma db push
    
    # Seed database
    echo "🌱 Seeding database with sample data..."
    npm run db:seed
    
else
    echo "⚠️  MySQL requires password. Please run the following commands manually:"
    echo "1. mysql -u root -p"
    echo "2. CREATE DATABASE clothing_store;"
    echo "3. npx prisma db push"
    echo "4. npm run db:seed"
fi

cd ..

echo ""
echo "🎉 Setup fixes completed!"
echo ""
echo "📋 Next steps:"
echo "1. If MySQL requires password, update backend/.env with your password"
echo "2. Start the development servers:"
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
