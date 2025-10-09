"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcryptjs_1.default.hash('Admin123!', 12);
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
    const shirtCategory = await prisma.category.findUnique({ where: { name: 'Shirts' } });
    const fabricCategory = await prisma.category.findUnique({ where: { name: 'Fabrics' } });
    const pantsCategory = await prisma.category.findUnique({ where: { name: 'Pants' } });
    const products = [
        {
            name: 'Cotton Shirt',
            sku: 'SHIRT-001',
            barcode: '123456789012',
            categoryId: shirtCategory.id,
            type: client_1.ProductType.READY_MADE,
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
            categoryId: fabricCategory.id,
            type: client_1.ProductType.FABRIC,
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
            categoryId: pantsCategory.id,
            type: client_1.ProductType.READY_MADE,
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
//# sourceMappingURL=seed.js.map