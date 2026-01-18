'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboard } from "@/components/AdminDashboard";
import { TrendingUp } from "lucide-react";

export default function AdminPage() {
    return (
        <Card className="bg-white shadow-sm border border-gray-200">
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
}
