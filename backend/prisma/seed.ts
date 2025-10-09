import { PrismaClient, ProductType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fabriccraft.com' },
    update: {},
    create: {
      email: 'admin@fabriccraft.com',
      username: 'admin',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create staff user
  const hashedStaffPassword = await bcrypt.hash('staff123', 10);

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@fabriccraft.com' },
    update: {},
    create: {
      email: 'staff@fabriccraft.com',
      username: 'staff',
      password: hashedStaffPassword,
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF',
      isActive: true,
    },
  });

  console.log('✅ Staff user created:', staffUser.email);

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
