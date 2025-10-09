'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customerApi, Customer, CustomerMeasurement } from "@/lib/api";
import {
    Plus,
    Edit,
    Trash2,
    User,
    Phone,
    Mail,
    MapPin,
    Ruler,
    Search,
    History,
    Save,
    Copy
} from "lucide-react";

export const CustomerManagement = () => {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: ""
    });
    const [newMeasurements, setNewMeasurements] = useState<Omit<CustomerMeasurement, 'id' | 'customerId' | 'createdAt'>>({
        name: "New Measurement",
        chest: undefined,
        waist: undefined,
        hip: undefined,
        shoulder: undefined,
        sleeve: undefined,
        length: undefined,
        inseam: undefined,
        neck: undefined,
        notes: ""
    });

    // Load customers on component mount
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerApi.getCustomers({ limit: 100 });
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error('Error loading customers:', error);
            toast({
                title: "Error",
                description: "Failed to load customers",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addCustomer = async () => {
        if (!newCustomer.firstName || !newCustomer.phone) {
            toast({
                title: "Missing Information",
                description: "Please fill in name and phone number",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const response = await customerApi.createCustomer(newCustomer);

            setCustomers([...customers, response.data.customer]);
            setNewCustomer({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: ""
            });
            setShowAddForm(false);

            toast({
                title: "Customer Added",
                description: "Customer successfully added to database",
            });
        } catch (error) {
            console.error('Error adding customer:', error);
            toast({
                title: "Error",
                description: "Failed to add customer",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const addMeasurements = async (customerId: string) => {
        const hasValidMeasurement = Object.values(newMeasurements).some(value =>
            typeof value === 'string' ? value.trim() !== '' : value !== undefined
        );

        if (!hasValidMeasurement) {
            toast({
                title: "No Measurements",
                description: "Please enter at least one measurement",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await customerApi.addCustomerMeasurement(customerId, newMeasurements);

            // Reload customers to get updated data
            await loadCustomers();

            setNewMeasurements({
                name: "New Measurement",
                chest: undefined,
                waist: undefined,
                hip: undefined,
                shoulder: undefined,
                sleeve: undefined,
                length: undefined,
                inseam: undefined,
                neck: undefined,
                notes: ""
            });

            toast({
                title: "Measurements Added",
                description: "Customer measurements saved successfully",
            });
        } catch (error) {
            console.error('Error adding measurements:', error);
            toast({
                title: "Error",
                description: "Failed to add measurements",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const copyMeasurements = (measurements: CustomerMeasurement) => {
        setNewMeasurements({
            name: measurements.name,
            chest: measurements.chest,
            waist: measurements.waist,
            hip: measurements.hip,
            shoulder: measurements.shoulder,
            sleeve: measurements.sleeve,
            length: measurements.length,
            inseam: measurements.inseam,
            neck: measurements.neck,
            notes: measurements.notes || ""
        });

        toast({
            title: "Measurements Copied",
            description: "Previous measurements copied to form",
        });
    };

    const deleteCustomer = async (id: string) => {
        try {
            setLoading(true);
            await customerApi.deleteCustomer(id);
            setCustomers(customers.filter(c => c.id !== id));
            if (selectedCustomer?.id === id) {
                setSelectedCustomer(null);
            }
            toast({
                title: "Customer Deleted",
                description: "Customer removed from database",
            });
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast({
                title: "Error",
                description: "Failed to delete customer",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer List */}
            <div className="lg:col-span-1 space-y-4">
                {/* Search */}
                <Card className="pos-card">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            className="w-full mt-3 primary-gradient text-white"
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Customer
                        </Button>
                    </CardContent>
                </Card>

                {/* Customer List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                        <Card
                            key={customer.id}
                            className={`pos-card cursor-pointer transition-all ${selectedCustomer?.id === customer.id
                                ? 'ring-2 ring-primary accent-gradient text-white'
                                : 'hover:fabric-shadow'
                                }`}
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium">{customer.firstName} {customer.lastName}</h3>
                                        <p className={`text-sm ${selectedCustomer?.id === customer.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                                            {customer.phone}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge variant={selectedCustomer?.id === customer.id ? "secondary" : "outline"} className="text-xs">
                                                {customer.email}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCustomer(customer.id);
                                        }}
                                        className={`${selectedCustomer?.id === customer.id ? 'text-white hover:text-white' : 'text-destructive hover:text-destructive'}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Customer Details */}
            <div className="lg:col-span-2 space-y-4">
                {selectedCustomer ? (
                    <>
                        {/* Customer Info */}
                        <Card className="pos-card">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="w-5 h-5" />
                                    <span>{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCustomer.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCustomer.email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedCustomer.address || "No address"}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <History className="w-4 h-4 text-muted-foreground" />
                                        <span>Created: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add New Measurements */}
                        <Card className="pos-card">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Ruler className="w-5 h-5" />
                                    <span>Add New Measurements</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Measurement Name</Label>
                                    <Input
                                        value={newMeasurements.name}
                                        onChange={(e) => setNewMeasurements({ ...newMeasurements, name: e.target.value })}
                                        placeholder="e.g., Wedding Suit Measurements"
                                    />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-2">
                                        <Label>Chest (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.chest || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, chest: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Waist (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.waist || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, waist: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="34"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hip (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.hip || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, hip: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="36"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Shoulder (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.shoulder || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, shoulder: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="17"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sleeve (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.sleeve || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, sleeve: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="25"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Length (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.length || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, length: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="42"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Inseam (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.inseam || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, inseam: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="32"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Neck (inches)</Label>
                                        <Input
                                            type="number"
                                            value={newMeasurements.neck || ''}
                                            onChange={(e) => setNewMeasurements({ ...newMeasurements, neck: e.target.value ? Number(e.target.value) : undefined })}
                                            placeholder="16"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={newMeasurements.notes}
                                        onChange={(e) => setNewMeasurements({ ...newMeasurements, notes: e.target.value })}
                                        placeholder="Any special notes or preferences..."
                                        rows={2}
                                    />
                                </div>
                                <Button
                                    className="primary-gradient text-white"
                                    onClick={() => addMeasurements(selectedCustomer.id)}
                                    disabled={loading}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? "Saving..." : "Save Measurements"}
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="pos-card">
                        <CardContent className="text-center py-12">
                            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Select a Customer</h3>
                            <p className="text-muted-foreground">
                                Choose a customer from the list to view and manage their measurements
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add Customer Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Plus className="w-5 h-5" />
                                <span>Add New Customer</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name *</Label>
                                    <Input
                                        value={newCustomer.firstName}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                                        placeholder="First name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={newCustomer.lastName}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone *</Label>
                                <Input
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    placeholder="Customer address"
                                    rows={2}
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button
                                    className="primary-gradient text-white flex-1"
                                    onClick={addCustomer}
                                    disabled={loading}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {loading ? "Adding..." : "Add Customer"}
                                </Button>
                                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
