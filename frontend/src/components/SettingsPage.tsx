'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { settingsApi } from "@/lib/api";
import {
    Settings,
    MessageSquare,
    Link as LinkIcon,
    Cloud,
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    TestTube2,
    Info,
    Building2,
    Upload,
    Image as ImageIcon
} from "lucide-react";

interface WhatsAppSettings {
    enabled: boolean;
    method: 'web' | 'api';
    apiUrl?: string;
    accessToken?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
}

interface BusinessSettings {
    businessName: string;
    businessAddress?: string;
    businessCity?: string;
    businessState?: string;
    businessPincode?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessGSTIN?: string;
    businessLogo?: string;
    invoiceTemplate: 'modern' | 'classic' | 'minimal' | 'elegant';
    taxRate: number;
}

export const SettingsPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [settings, setSettings] = useState<WhatsAppSettings>({
        enabled: true,
        method: 'web',
    });
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
        businessName: 'FabricCraft Clothing Store',
        invoiceTemplate: 'modern',
        taxRate: 18,
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
        loadBusinessSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsApi.getWhatsAppSettings();
            if (response.data.settings) {
                setSettings(response.data.settings);
            }
        } catch (error: any) {
            console.error('Error loading settings:', error);
            // Use default settings if fetch fails
            setSettings({
                enabled: true,
                method: 'web',
            });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            setLoading(true);

            // Validate Business API fields if method is 'api'
            if (settings.method === 'api' && settings.enabled) {
                if (!settings.apiUrl || !settings.accessToken || !settings.phoneNumberId) {
                    toast({
                        title: "Validation Error",
                        description: "API URL, Access Token, and Phone Number ID are required for Business API",
                        variant: "destructive"
                    });
                    return;
                }
            }

            await settingsApi.updateWhatsAppSettings(settings);

            toast({
                title: "Settings Saved",
                description: "WhatsApp settings have been updated successfully",
            });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error?.message || "Failed to save settings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        try {
            setTesting(true);
            const response = await settingsApi.testWhatsAppConnection();

            toast({
                title: "Connection Test",
                description: response.message || "Connection test successful",
            });
        } catch (error: any) {
            toast({
                title: "Connection Test Failed",
                description: error.response?.data?.error?.message || "Failed to test connection",
                variant: "destructive"
            });
        } finally {
            setTesting(false);
        }
    };

    const loadBusinessSettings = async () => {
        try {
            const response = await settingsApi.getBusinessSettings();
            if (response.data.settings) {
                setBusinessSettings(response.data.settings);
                if (response.data.settings.businessLogo) {
                    setLogoPreview(response.data.settings.businessLogo);
                }
            }
        } catch (error: any) {
            console.error('Error loading business settings:', error);
        }
    };

    const saveBusinessSettings = async () => {
        try {
            setLoading(true);
            await settingsApi.updateBusinessSettings(businessSettings);
            toast({
                title: "Settings Saved",
                description: "Business settings updated successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error?.message || "Failed to save settings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Logo must be less than 2MB",
                variant: "destructive"
            });
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setLogoPreview(base64);
                setBusinessSettings({ ...businessSettings, businessLogo: base64 });

                toast({
                    title: "Logo Uploaded",
                    description: "Logo will be saved when you click Save Settings",
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: "Failed to upload logo",
                variant: "destructive"
            });
        }
    };

    const generateSampleInvoice = async () => {
        try {
            setLoading(true);

            // Create a sample bill data for preview
            const sampleBillData = {
                id: 'sample',
                billNumber: 'SAMPLE-001',
                createdAt: new Date(),
                customer: {
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+91 98765 43210',
                    email: 'john.doe@example.com',
                    address: '123 Sample Street, Sample City'
                },
                items: [
                    {
                        customName: 'Sample Fabric',
                        description: 'Cotton fabric for sample invoice',
                        quantity: 2,
                        unit: 'meters',
                        unitPrice: 150.00,
                        totalPrice: 300.00,
                        isTailoring: false
                    },
                    {
                        customName: 'Sample Tailoring',
                        description: 'Custom tailoring service',
                        quantity: 1,
                        unit: 'piece',
                        unitPrice: 500.00,
                        totalPrice: 500.00,
                        isTailoring: true,
                        measurements: {
                            chest: '40 inches',
                            waist: '32 inches',
                            length: '30 inches'
                        }
                    }
                ],
                totalAmount: 800.00,
                discountAmount: 50.00,
                taxAmount: 135.00,
                finalAmount: 885.00,
                paymentMethod: 'Cash',
                paymentStatus: 'Completed',
                notes: 'This is a sample invoice for template preview'
            };

            // Generate sample invoice PDF
            const blob = await settingsApi.generateSampleInvoice(sampleBillData, businessSettings.invoiceTemplate);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `sample-invoice-${businessSettings.invoiceTemplate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Sample Invoice Generated",
                description: `Sample invoice with ${businessSettings.invoiceTemplate} template has been downloaded`,
            });
        } catch (error) {
            console.error('Error generating sample invoice:', error);
            toast({
                title: "Error",
                description: "Failed to generate sample invoice",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="w-8 h-8" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your application settings and integrations
                    </p>
                </div>
            </div>

            <Tabs defaultValue="business" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="business" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Business Settings
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp Integration
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="business" className="space-y-6">
                    {/* Business Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Business Information
                            </CardTitle>
                            <CardDescription>
                                Configure your business details that appear on invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-4">
                                <Label>Business Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label htmlFor="logo-upload">
                                            <Button variant="outline" className="cursor-pointer" asChild>
                                                <span>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Logo
                                                </span>
                                            </Button>
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            PNG, JPG up to 2MB. Recommended: 200x200px
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="businessName">Business Name *</Label>
                                    <Input
                                        id="businessName"
                                        value={businessSettings.businessName}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                                        placeholder="FabricCraft Clothing Store"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessPhone">Phone Number</Label>
                                    <Input
                                        id="businessPhone"
                                        value={businessSettings.businessPhone || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessPhone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessEmail">Email Address</Label>
                                    <Input
                                        id="businessEmail"
                                        type="email"
                                        value={businessSettings.businessEmail || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessEmail: e.target.value })}
                                        placeholder="info@fabriccraft.com"
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="businessAddress">Address</Label>
                                    <Input
                                        id="businessAddress"
                                        value={businessSettings.businessAddress || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessAddress: e.target.value })}
                                        placeholder="123 Main Street"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessCity">City</Label>
                                    <Input
                                        id="businessCity"
                                        value={businessSettings.businessCity || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessCity: e.target.value })}
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessState">State</Label>
                                    <Input
                                        id="businessState"
                                        value={businessSettings.businessState || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessState: e.target.value })}
                                        placeholder="Maharashtra"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessPincode">Pincode</Label>
                                    <Input
                                        id="businessPincode"
                                        value={businessSettings.businessPincode || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessPincode: e.target.value })}
                                        placeholder="400001"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessGSTIN">GSTIN</Label>
                                    <Input
                                        id="businessGSTIN"
                                        value={businessSettings.businessGSTIN || ''}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessGSTIN: e.target.value })}
                                        placeholder="22XXXXX1234X1Z5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        value={businessSettings.taxRate}
                                        onChange={(e) => setBusinessSettings({ ...businessSettings, taxRate: parseFloat(e.target.value) })}
                                        placeholder="18"
                                    />
                                </div>
                            </div>

                            {/* Invoice Template Selection */}
                            <div className="space-y-4">
                                <Label>Invoice Template</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        {
                                            value: 'modern',
                                            name: 'Modern',
                                            description: 'Clean design with accent colors',
                                            preview: 'Modern header with colored background, clean typography, and structured layout'
                                        },
                                        {
                                            value: 'classic',
                                            name: 'Classic',
                                            description: 'Traditional business style',
                                            preview: 'Traditional layout with formal styling, clear sections, and professional appearance'
                                        },
                                        {
                                            value: 'minimal',
                                            name: 'Minimal',
                                            description: 'Simple and clean layout',
                                            preview: 'Minimalist design with plenty of white space and simple typography'
                                        },
                                        {
                                            value: 'elegant',
                                            name: 'Elegant',
                                            description: 'Sophisticated design',
                                            preview: 'Elegant styling with refined typography and sophisticated layout'
                                        },
                                    ].map((template) => (
                                        <div
                                            key={template.value}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${businessSettings.invoiceTemplate === template.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                            onClick={() => setBusinessSettings({ ...businessSettings, invoiceTemplate: template.value as any })}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <input
                                                    type="radio"
                                                    checked={businessSettings.invoiceTemplate === template.value}
                                                    onChange={() => setBusinessSettings({ ...businessSettings, invoiceTemplate: template.value as any })}
                                                    className="w-4 h-4 mt-1"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{template.name}</h3>
                                                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                                                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                                                        <strong>Preview:</strong> {template.preview}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        💡 <strong>Tip:</strong> You can generate a sample invoice to preview how each template will look with your business information.
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={generateSampleInvoice}
                                        disabled={loading}
                                        className="ml-4"
                                    >
                                        Generate Sample Invoice
                                    </Button>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={saveBusinessSettings}
                                    disabled={loading}
                                    className="primary-gradient text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Business Settings
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="whatsapp" className="space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>WhatsApp Integration Status</span>
                                <Badge variant={settings.enabled ? "default" : "secondary"}>
                                    {settings.enabled ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Enabled
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Disabled
                                        </span>
                                    )}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Current method: <strong>{settings.method === 'web' ? 'WhatsApp Web Link' : 'Business API'}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="whatsapp-enabled"
                                    checked={settings.enabled}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                                />
                                <Label htmlFor="whatsapp-enabled" className="text-sm">
                                    Enable WhatsApp integration for sending invoices
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Method Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Method</CardTitle>
                            <CardDescription>
                                Choose how you want to send WhatsApp messages
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Web Method */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${settings.method === 'web'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                                onClick={() => setSettings({ ...settings, method: 'web' })}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1">
                                        <input
                                            type="radio"
                                            checked={settings.method === 'web'}
                                            onChange={() => setSettings({ ...settings, method: 'web' })}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LinkIcon className="w-5 h-5 text-primary" />
                                            <h3 className="font-semibold">WhatsApp Web Link</h3>
                                            <Badge variant="secondary">Recommended</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Opens WhatsApp with a pre-filled message. User clicks send to deliver the message.
                                        </p>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span>✓ No setup required</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span>✓ Works immediately</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span>✓ Free to use</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* API Method */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${settings.method === 'api'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                                onClick={() => setSettings({ ...settings, method: 'api' })}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1">
                                        <input
                                            type="radio"
                                            checked={settings.method === 'api'}
                                            onChange={() => setSettings({ ...settings, method: 'api' })}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cloud className="w-5 h-5 text-blue-500" />
                                            <h3 className="font-semibold">WhatsApp Business API</h3>
                                            <Badge variant="outline">Advanced</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Automatically sends messages via WhatsApp Business API without user interaction.
                                        </p>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span>✓ Fully automated</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span>✓ Professional messaging</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Info className="w-3 h-3 text-amber-500" />
                                                <span>Requires Facebook Business Account</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business API Configuration */}
                    {settings.method === 'api' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>WhatsApp Business API Configuration</CardTitle>
                                <CardDescription>
                                    Enter your WhatsApp Business API credentials from Meta Developer Console
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apiUrl">API URL *</Label>
                                    <Input
                                        id="apiUrl"
                                        placeholder="https://graph.facebook.com/v18.0"
                                        value={settings.apiUrl || ''}
                                        onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The WhatsApp Business API base URL
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accessToken">Access Token *</Label>
                                    <Input
                                        id="accessToken"
                                        type="password"
                                        placeholder="Enter your permanent access token"
                                        value={settings.accessToken || ''}
                                        onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Your WhatsApp Business API permanent access token
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                                    <Input
                                        id="phoneNumberId"
                                        placeholder="Enter your phone number ID"
                                        value={settings.phoneNumberId || ''}
                                        onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The ID of your registered WhatsApp Business phone number
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessAccountId">Business Account ID (Optional)</Label>
                                    <Input
                                        id="businessAccountId"
                                        placeholder="Enter your business account ID"
                                        value={settings.businessAccountId || ''}
                                        onChange={(e) => setSettings({ ...settings, businessAccountId: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Your WhatsApp Business Account ID
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={testConnection}
                                        disabled={!settings.enabled || testing}
                                        className="w-full"
                                    >
                                        {testing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Testing Connection...
                                            </>
                                        ) : (
                                            <>
                                                <TestTube2 className="w-4 h-4 mr-2" />
                                                Test Connection
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={saveSettings}
                            disabled={loading}
                            className="primary-gradient text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

