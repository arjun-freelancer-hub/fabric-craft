'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react";
import { reportApi, billApi, customerApi, productApi } from "@/lib/api";

interface DashboardStats {
    salesCount: number;
    totalCustomers: number;
    fabricRolls: number;
    revenue: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        salesCount: 0,
        totalCustomers: 0,
        fabricRolls: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayISO = today.toISOString();

            // Fetch dashboard overview
            const dashboardResponse = await reportApi.getDashboardOverview();
            const dashboard = dashboardResponse.data?.dashboard;

            // Fetch today's bills
            const billsResponse = await billApi.getBills({
                page: 1,
                limit: 1000,
            });
            const todayBills = billsResponse.data?.bills?.filter((bill: any) => {
                const billDate = new Date(bill.createdAt);
                return billDate >= today && bill.status === 'ACTIVE';
            }) || [];

            // Calculate today's sales count and revenue
            const salesCount = todayBills.length;
            const revenue = todayBills.reduce((sum: number, bill: any) => sum + (bill.finalAmount || 0), 0);

            // Fetch customers
            const customersResponse = await customerApi.getCustomers({ limit: 1000 });
            const totalCustomers = customersResponse.data?.pagination?.total || 0;

            // Fetch products (fabric rolls)
            const productsResponse = await productApi.getProducts({ limit: 1000 });
            const fabricRolls = productsResponse.data?.products?.filter((p: any) => 
                p.type === 'FABRIC'
            ).length || 0;

            setStats({
                salesCount: dashboard?.sales?.today ? salesCount : salesCount,
                totalCustomers: dashboard?.customers?.total || totalCustomers,
                fabricRolls: dashboard?.inventory?.totalProducts || fabricRolls,
                revenue: dashboard?.sales?.today || revenue,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const metricCards = [
        {
            title: 'Sales Count',
            value: stats.salesCount,
            icon: ShoppingCart,
            color: 'blue',
            bgColor: 'bg-blue-500',
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: Users,
            color: 'purple',
            bgColor: 'bg-purple-500',
        },
        {
            title: 'Fabric Rolls',
            value: stats.fabricRolls,
            icon: Package,
            color: 'orange',
            bgColor: 'bg-orange-500',
        },
        {
            title: 'Revenue',
            value: `₹${stats.revenue.toFixed(2)}`,
            icon: DollarSign,
            color: 'green',
            bgColor: 'bg-green-500',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Overview of your business metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Card key={metric.title} className="bg-white shadow-sm border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            {metric.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {metric.value}
                                        </p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
