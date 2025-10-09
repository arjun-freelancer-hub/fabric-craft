'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { billApi, Bill } from "@/lib/api";
import { FileText, Download, Share2, Eye } from "lucide-react";

export const InvoiceViewer = () => {
    const { toast } = useToast();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        try {
            setLoading(true);
            const response = await billApi.getBills({ limit: 50 });
            setBills(response.data.bills || []);
        } catch (error) {
            console.error('Error loading bills:', error);
            toast({
                title: "Error",
                description: "Failed to load invoices",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (billId: string) => {
        try {
            const blob = await billApi.generateInvoice(billId, 'pdf');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${billId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Success",
                description: "Invoice downloaded successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download invoice",
                variant: "destructive"
            });
        }
    };

    const viewInvoice = async (billId: string) => {
        try {
            const blob = await billApi.generateInvoice(billId, 'pdf');
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');

            // Clean up after a delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);

            toast({
                title: "Success",
                description: "Opening invoice in new tab",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to view invoice",
                variant: "destructive"
            });
        }
    };

    const sendWhatsApp = async (bill: Bill) => {
        try {
            if (!bill.customer.phone) {
                toast({
                    title: "Error",
                    description: "Customer phone number not available",
                    variant: "destructive"
                });
                return;
            }

            const response = await billApi.sendInvoiceWhatsApp(
                bill.id,
                bill.customer.phone
                // Don't pass custom message - let backend generate it with PDF link
            );

            // If response contains a WhatsApp URL, open it
            if (response.data?.whatsappUrl) {
                window.open(response.data.whatsappUrl, '_blank');
                toast({
                    title: "WhatsApp Opened",
                    description: "Please send the message from WhatsApp",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Invoice sent via WhatsApp successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send invoice via WhatsApp",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-4">
            {bills.map((bill) => (
                <div key={bill.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Invoice #{bill.billNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                                {bill.customer.firstName} {bill.customer.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(bill.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant={bill.status === 'completed' ? 'default' : 'secondary'}>
                                {bill.status}
                            </Badge>
                            <Badge variant={bill.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                                {bill.paymentStatus}
                            </Badge>
                            <span className="font-medium">₹{bill.finalAmount}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => viewInvoice(bill.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadInvoice(bill.id)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => sendWhatsApp(bill)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            WhatsApp
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
