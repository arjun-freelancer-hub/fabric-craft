"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const Logger_1 = require("@/utils/Logger");
class ReportController {
    constructor() {
        this.logger = new Logger_1.Logger();
    }
    async getSalesReport(req, res, next) {
        try {
            const { dateFrom, dateTo, groupBy } = req.query;
            const report = {
                period: {
                    from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    to: dateTo || new Date().toISOString(),
                },
                summary: {
                    totalSales: 125000,
                    totalBills: 150,
                    averageBillValue: 833.33,
                    growth: 12.5,
                },
                dailySales: [
                    { date: '2024-01-01', amount: 5000, bills: 6 },
                    { date: '2024-01-02', amount: 7500, bills: 8 },
                    { date: '2024-01-03', amount: 6200, bills: 7 },
                ],
                paymentMethods: {
                    CASH: 45000,
                    UPI: 35000,
                    CARD: 25000,
                    NETBANKING: 20000,
                },
            };
            res.status(200).json({
                success: true,
                data: { report },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getInventoryReport(req, res, next) {
        try {
            const { categoryId, lowStock } = req.query;
            const report = {
                summary: {
                    totalProducts: 150,
                    totalValue: 250000,
                    lowStockItems: 12,
                    outOfStockItems: 3,
                },
                categories: [
                    { name: 'Shirts', count: 45, value: 90000 },
                    { name: 'Pants', count: 35, value: 70000 },
                    { name: 'Dresses', count: 30, value: 60000 },
                    { name: 'Accessories', count: 40, value: 30000 },
                ],
                lowStockProducts: [
                    { name: 'Cotton Shirt', sku: 'SHIRT-001', currentStock: 5, minStock: 10 },
                    { name: 'Denim Jeans', sku: 'JEANS-001', currentStock: 3, minStock: 8 },
                ],
            };
            res.status(200).json({
                success: true,
                data: { report },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCustomerReport(req, res, next) {
        try {
            const { dateFrom, dateTo, topCustomers } = req.query;
            const report = {
                summary: {
                    totalCustomers: 250,
                    newCustomers: 15,
                    activeCustomers: 180,
                    averageOrderValue: 1200,
                },
                topCustomers: [
                    { name: 'John Doe', totalSpent: 15000, orders: 12 },
                    { name: 'Jane Smith', totalSpent: 12000, orders: 10 },
                    { name: 'Mike Johnson', totalSpent: 10000, orders: 8 },
                ],
                customerGrowth: [
                    { month: 'Jan', newCustomers: 20 },
                    { month: 'Feb', newCustomers: 25 },
                    { month: 'Mar', newCustomers: 18 },
                ],
            };
            res.status(200).json({
                success: true,
                data: { report },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductPerformanceReport(req, res, next) {
        try {
            const { dateFrom, dateTo, topProducts } = req.query;
            const report = {
                summary: {
                    totalProducts: 150,
                    topSellingProducts: 10,
                    averageSalesPerProduct: 2500,
                },
                topProducts: [
                    { name: 'Cotton Shirt', sku: 'SHIRT-001', sales: 45, revenue: 36000 },
                    { name: 'Denim Jeans', sku: 'JEANS-001', sales: 35, revenue: 42000 },
                    { name: 'Summer Dress', sku: 'DRESS-001', sales: 30, revenue: 30000 },
                ],
                categoryPerformance: [
                    { category: 'Shirts', sales: 120, revenue: 96000 },
                    { category: 'Pants', sales: 80, revenue: 96000 },
                    { category: 'Dresses', sales: 60, revenue: 60000 },
                ],
            };
            res.status(200).json({
                success: true,
                data: { report },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboardOverview(req, res, next) {
        try {
            const { dateFrom, dateTo } = req.query;
            const dashboard = {
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
            };
            res.status(200).json({
                success: true,
                data: { dashboard },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=ReportController.js.map