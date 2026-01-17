'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosInterface } from "@/components/PosInterface";
import { ProductCatalog } from "@/components/ProductCatalog";
import { CustomerManagement } from "@/components/CustomerManagement";
import { BarcodeGenerator } from "@/components/BarcodeGenerator";
import { InvoiceViewer } from "@/components/InvoiceViewer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SettingsPage } from "@/components/SettingsPage";
import { TeamManagement } from "@/components/TeamManagement";
import { useDashboardNav } from "./layout";
import {
  ShoppingCart,
  Package,
  Users,
  QrCode,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { activeSection } = useDashboardNav();

  const renderContent = () => {
    switch (activeSection) {
      case 'billing':
        return (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Point of Sale - Fabric & Garments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PosInterface />
            </CardContent>
          </Card>
        );
      case 'products':
        return (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Product Catalog Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductCatalog />
            </CardContent>
          </Card>
        );
      case 'customers':
        return (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Customer & Measurements Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerManagement />
            </CardContent>
          </Card>
        );
      case 'barcodes':
        return (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Barcode Generation & Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeGenerator />
            </CardContent>
          </Card>
        );
      case 'invoices':
        return (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Invoice Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceViewer />
            </CardContent>
          </Card>
        );
      case 'team':
        return <TeamManagement />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Admin Dashboard & Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminDashboard />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return renderContent();
}