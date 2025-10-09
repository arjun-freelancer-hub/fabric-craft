'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Printer } from "lucide-react";

export const BarcodeGenerator = () => {
    const { toast } = useToast();
    const [barcodeData, setBarcodeData] = useState("");
    const [barcodeType, setBarcodeType] = useState("CODE128");

    const generateBarcode = () => {
        if (!barcodeData) {
            toast({
                title: "Missing Data",
                description: "Please enter data to generate barcode",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Barcode Generated",
            description: "Barcode generated successfully",
        });
    };

    return (
        <div className="space-y-6">
            <Card className="pos-card">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5" />
                        <span>Barcode Generator</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Barcode Data</Label>
                            <Input
                                value={barcodeData}
                                onChange={(e) => setBarcodeData(e.target.value)}
                                placeholder="Enter product code or data"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Barcode Type</Label>
                            <select
                                value={barcodeType}
                                onChange={(e) => setBarcodeType(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="CODE128">CODE128</option>
                                <option value="EAN13">EAN13</option>
                                <option value="QR">QR Code</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button onClick={generateBarcode} className="primary-gradient text-white">
                            <QrCode className="w-4 h-4 mr-2" />
                            Generate Barcode
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button variant="outline">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
