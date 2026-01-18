'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceViewer } from "@/components/InvoiceViewer";
import { FileText } from "lucide-react";

export default function InvoicesPage() {
    return (
        <Card className="bg-white shadow-sm border border-gray-200">
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
}
