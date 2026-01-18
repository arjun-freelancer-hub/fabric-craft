'use client';

import { useEffect, createContext, useContext, useState, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWorkspace } from "@/store/hooks";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
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
    Scissors,
    TrendingUp,
    LogOut,
    User as UserIcon,
    UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardSection = 'billing' | 'products' | 'customers' | 'barcodes' | 'invoices' | 'team' | 'settings' | 'admin';

interface DashboardNavContextType {
    activeSection: DashboardSection;
    setActiveSection: (section: DashboardSection) => void;
}

const DashboardNavContext = createContext<DashboardNavContextType | undefined>(undefined);

export const useDashboardNav = () => {
    const context = useContext(DashboardNavContext);
    if (!context) {
        throw new Error('useDashboardNav must be used within DashboardLayout');
    }
    return context;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [activeSection, setActiveSection] = useState<DashboardSection>("billing");
    const { authState, logout } = useAuth();
    const { currentWorkspace, fetchWorkspaces } = useWorkspace();

    useEffect(() => {
        // Load workspaces on mount
        fetchWorkspaces();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const isAdminOrOwner = currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN';

    const menuItems = [
        {
            id: 'billing' as DashboardSection,
            label: 'POS Billing',
            icon: ShoppingCart,
        },
        {
            id: 'products' as DashboardSection,
            label: 'Catalog',
            icon: Package,
        },
        {
            id: 'customers' as DashboardSection,
            label: 'Customers',
            icon: Users,
        },
        {
            id: 'barcodes' as DashboardSection,
            label: 'Barcodes',
            icon: QrCode,
        },
        {
            id: 'invoices' as DashboardSection,
            label: 'Invoices',
            icon: FileText,
        },
        ...(isAdminOrOwner ? [
            {
                id: 'team' as DashboardSection,
                label: 'Team',
                icon: UserPlus,
            },
            {
                id: 'settings' as DashboardSection,
                label: 'Settings',
                icon: Settings,
            },
            {
                id: 'admin' as DashboardSection,
                label: 'Admin',
                icon: TrendingUp,
            },
        ] : []),
    ];

    return (
        <DashboardNavContext.Provider value={{ activeSection, setActiveSection }}>
            <SidebarProvider>
                <Sidebar variant="inset" collapsible="icon">
                    <SidebarHeader>
                        <div className="flex items-center space-x-3 px-2 py-2">
                            <div className="w-10 h-10 fabric-gradient rounded-lg flex items-center justify-center shrink-0">
                                <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h2 className="text-base font-semibold text-sidebar-foreground truncate">FabricCraft</h2>
                                <p className="text-xs text-muted-foreground truncate">Billing System</p>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    onClick={() => setActiveSection(item.id)}
                                                    isActive={activeSection === item.id}
                                                    className={cn(
                                                        "w-full justify-start",
                                                        activeSection === item.id && "primary-gradient !text-white [&>svg]:!text-white [&>span]:!text-white"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4 mr-2" />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <div className="px-2 py-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <UserIcon className="w-4 h-4" />
                                <span className="truncate">
                                    {authState.user?.firstName} {authState.user?.lastName}
                                </span>
                            </div>
                            {currentWorkspace && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                    {currentWorkspace.role}
                                </Badge>
                            )}
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    {/* Header */}
                    <header className="border-b border-border bg-card sticky top-0 z-10">
                        <div className="flex h-16 items-center gap-4 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex-1" />
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
                    </header>

                    {/* Main Content */}
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </DashboardNavContext.Provider>
    );
}