'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerManagement } from "@/components/CustomerManagement";
import { Users } from "lucide-react";

export default function CustomersPage() {
    return (
        <Card className="bg-white shadow-sm border border-gray-200">
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
}
