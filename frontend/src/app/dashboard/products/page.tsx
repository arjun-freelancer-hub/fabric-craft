'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCatalog } from "@/components/ProductCatalog";
import { Package } from "lucide-react";

export default function ProductsPage() {
    return (
        <Card className="bg-white shadow-sm border border-gray-200">
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
}
