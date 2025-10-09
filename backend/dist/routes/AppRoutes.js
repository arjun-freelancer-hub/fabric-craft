"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const AuthRoutes_1 = require("./AuthRoutes");
const WorkspaceRoutes_1 = require("./WorkspaceRoutes");
const ProductRoutes_1 = require("./ProductRoutes");
const CustomerRoutes_1 = require("./CustomerRoutes");
const BillRoutes_1 = require("./BillRoutes");
const InventoryRoutes_1 = require("./InventoryRoutes");
const CategoryRoutes_1 = require("./CategoryRoutes");
const UserRoutes_1 = require("./UserRoutes");
const BarcodeRoutes_1 = require("./BarcodeRoutes");
const ReportRoutes_1 = require("./ReportRoutes");
const SettingRoutes_1 = require("./SettingRoutes");
class AppRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
            });
        });
        this.router.use('/auth', new AuthRoutes_1.AuthRoutes().getRouter());
        this.router.use('/workspaces', new WorkspaceRoutes_1.WorkspaceRoutes().getRouter());
        this.router.use('/products', new ProductRoutes_1.ProductRoutes().getRouter());
        this.router.use('/customers', new CustomerRoutes_1.CustomerRoutes().getRouter());
        this.router.use('/bills', new BillRoutes_1.BillRoutes().getRouter());
        this.router.use('/inventory', new InventoryRoutes_1.InventoryRoutes().getRouter());
        this.router.use('/categories', new CategoryRoutes_1.CategoryRoutes().getRouter());
        this.router.use('/users', new UserRoutes_1.UserRoutes().getRouter());
        this.router.use('/barcodes', new BarcodeRoutes_1.BarcodeRoutes().getRouter());
        this.router.use('/reports', new ReportRoutes_1.ReportRoutes().getRouter());
        this.router.use('/settings', new SettingRoutes_1.SettingRoutes().getRouter());
    }
    getRouter() {
        return this.router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=AppRoutes.js.map