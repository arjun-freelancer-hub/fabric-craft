'use client';

import { useEffect, ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWorkspace } from "@/store/hooks";
import { settingsApi, billApi } from "@/lib/api";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    ShoppingCart,
    Package,
    Users,
    QrCode,
    FileText,
    Settings,
    LayoutDashboard,
    TrendingUp,
    LogOut,
    User as UserIcon,
    UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
    id: string;
    label: string;
    icon: any;
    path: string;
    adminOnly?: boolean;
}

interface BusinessSettings {
    businessName?: string;
    businessGSTIN?: string;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { authState, logout } = useAuth();
    const { currentWorkspace, fetchWorkspaces } = useWorkspace();
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({});
    const [todaySales, setTodaySales] = useState<number>(0);

    useEffect(() => {
        fetchWorkspaces();
        loadBusinessSettings();
        loadTodaySales();
    }, []);

    const loadBusinessSettings = async () => {
        try {
            const response = await settingsApi.getBusinessSettings();
            if (response.data?.settings) {
                setBusinessSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Error loading business settings:', error);
        }
    };

    const loadTodaySales = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayISO = today.toISOString();

            const response = await billApi.getBills({
                page: 1,
                limit: 1000,
            });
            
            const todayBills = response.data?.bills?.filter((bill: any) => {
                const billDate = new Date(bill.createdAt);
                return billDate >= today && bill.status === 'ACTIVE';
            }) || [];

            const totalSales = todayBills.reduce((sum: number, bill: any) => 
                sum + (bill.finalAmount || 0), 0
            );
            
            setTodaySales(totalSales);
        } catch (error) {
            console.error('Error loading today sales:', error);
            setTodaySales(0);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const isAdminOrOwner = currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN';

    const menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
        },
        {
            id: 'billing',
            label: 'POS Billing',
            icon: ShoppingCart,
            path: '/dashboard/billing',
        },
        {
            id: 'products',
            label: 'Catalog',
            icon: Package,
            path: '/dashboard/products',
        },
        {
            id: 'customers',
            label: 'Customers',
            icon: Users,
            path: '/dashboard/customers',
        },
        {
            id: 'barcodes',
            label: 'Barcodes',
            icon: QrCode,
            path: '/dashboard/barcodes',
        },
        {
            id: 'invoices',
            label: 'Invoices',
            icon: FileText,
            path: '/dashboard/invoices',
        },
        ...(isAdminOrOwner ? [
            {
                id: 'team',
                label: 'Team',
                icon: UserPlus,
                path: '/dashboard/team',
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: Settings,
                path: '/dashboard/settings',
            },
            {
                id: 'admin',
                label: 'Admin',
                icon: TrendingUp,
                path: '/dashboard/admin',
            },
        ] : []),
    ];

    const businessName = businessSettings.businessName || currentWorkspace?.name || 'FabricCraft';
    const gstin = businessSettings.businessGSTIN || '';

    return (
        <SidebarProvider>
            <Sidebar variant="inset" collapsible="icon" className="bg-[#1e293b] border-r border-[#334155]">
                <SidebarHeader className="border-b border-[#334155] p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center shrink-0">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-base font-semibold text-white truncate">{businessName}</h2>
                            <p className="text-xs text-gray-400 truncate">Billing System</p>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="bg-[#1e293b]">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/dashboard');
                                    return (
                                        <SidebarMenuItem key={item.id}>
                                            <Link href={item.path}>
                                                <SidebarMenuButton
                                                    isActive={isActive}
                                                    className={cn(
                                                        "w-full justify-start text-gray-300 hover:text-white hover:bg-[#334155] transition-colors",
                                                        isActive && "bg-[#3b82f6] text-white hover:bg-[#3b82f6]"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4 mr-2" />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="border-t border-[#334155] p-4 bg-[#1e293b]">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-semibold">
                                {authState.user?.firstName?.[0] || 'A'}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm text-white font-medium truncate">
                                {authState.user?.firstName} {authState.user?.lastName}
                            </span>
                            {currentWorkspace && (
                                <Badge variant="secondary" className="mt-1 text-xs bg-[#334155] text-gray-300">
                                    {currentWorkspace.role}
                                </Badge>
                            )}
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset className="bg-[#f1f5f9]">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex h-16 items-center gap-4 px-6">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex-1" />
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-end text-sm">
                                <div className="font-semibold text-gray-900">{businessName}</div>
                                {gstin && (
                                    <div className="text-xs text-gray-500">GSTIN: {gstin}</div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">₹{todaySales.toFixed(2)} TODAY'S SALES</div>
                            </div>
                            <WorkspaceSelector />
                            <div className="flex items-center space-x-2">
                                <UserIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">
                                    {authState.user?.firstName} {authState.user?.lastName}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col p-6 bg-[#f1f5f9] min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
