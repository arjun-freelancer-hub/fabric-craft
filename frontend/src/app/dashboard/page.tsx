'use client';

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PosInterface } from "@/components/PosInterface";
import { ProductCatalog } from "@/components/ProductCatalog";
import { CustomerManagement } from "@/components/CustomerManagement";
import { BarcodeGenerator } from "@/components/BarcodeGenerator";
import { InvoiceViewer } from "@/components/InvoiceViewer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { SettingsPage } from "@/components/SettingsPage";
import { TeamManagement } from "@/components/TeamManagement";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWorkspace } from "@/store/hooks";
import {
  ShoppingCart,
  Package,
  Users,
  QrCode,
  FileText,
  Settings,
  Ruler,
  Scissors,
  TrendingUp,
  LogOut,
  User as UserIcon,
  UserPlus
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("billing");
  const { authState, logout } = useAuth();
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();

  useEffect(() => {
    // Load workspaces on mount
    fetchWorkspaces();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 fabric-gradient rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FabricCraft Billing</h1>
                <p className="text-sm text-muted-foreground">Professional Clothing Store Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Workspace Selector */}
              <WorkspaceSelector />

              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <TrendingUp className="w-3 h-3 mr-1" />
                System Active
              </Badge>
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {authState.user?.firstName} {authState.user?.lastName}
                </span>
                {currentWorkspace && (
                  <Badge variant="secondary" className="text-xs">
                    {currentWorkspace.role}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN' ? 'grid-cols-8' : 'grid-cols-5'} bg-muted/50 p-1 rounded-lg`}>
            <TabsTrigger
              value="billing"
              className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>POS Billing</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
            >
              <Package className="w-4 h-4" />
              <span>Catalog</span>
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger
              value="barcodes"
              className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
            >
              <QrCode className="w-4 h-4" />
              <span>Barcodes</span>
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4" />
              <span>Invoices</span>
            </TabsTrigger>
            {(currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN') && (
              <>
                <TabsTrigger
                  value="team"
                  className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Team</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex items-center space-x-2 data-[state=active]:primary-gradient data-[state=active]:text-white"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="billing" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="barcodes" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
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
            </TabsContent>

            {(currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN') && (
              <>
                <TabsContent value="team" className="space-y-4">
                  <TeamManagement />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <SettingsPage />
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
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
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}