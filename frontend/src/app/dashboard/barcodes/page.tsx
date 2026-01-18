'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeGenerator } from "@/components/BarcodeGenerator";
import { QrCode } from "lucide-react";

export default function BarcodesPage() {
    return (
        <Card className="bg-white shadow-sm border border-gray-200">
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
}
