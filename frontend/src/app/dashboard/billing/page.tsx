'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosInterface } from "@/components/PosInterface";
import { ShoppingCart } from "lucide-react";

export default function BillingPage() {
    return (
        <Card className="bg-white shadow-sm border border-gray-200">
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
}
