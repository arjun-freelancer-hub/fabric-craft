'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { productApi, customerApi, billApi, Product, Customer } from "@/lib/api";
import { CustomerDropdown } from "@/components/CustomerDropdown";
import {
  Plus,
  Minus,
  Trash2,
  Calculator,
  Ruler,
  Scissors,
  QrCode,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  Printer,
  Share2,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";

interface CartItem {
  id: string;
  type: 'FABRIC' | 'READY_MADE' | 'ACCESSORY' | 'TAILORING_SERVICE' | 'CUSTOM';
  name: string;
  price: number;
  quantity: number;
  meters?: number;
  pricePerMeter?: number;
  needsTailoring: boolean;
  tailoringCost: number;
  barcode?: string;
  productId?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  customerId?: string;
}

interface Measurements {
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
  sleeve: string;
  length: string;
  inseam: string;
  neck: string;
  notes: string;
}

export const PosInterface = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [measurements, setMeasurements] = useState<Measurements>({
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    sleeve: "",
    length: "",
    inseam: "",
    neck: "",
    notes: ""
  });
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18); // GST 18%
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [lastGeneratedBill, setLastGeneratedBill] = useState<any>(null);
  const [lastCustomerPhone, setLastCustomerPhone] = useState<string>("");

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProducts({ limit: 100 });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, meters = 1) => {
    const cartItem: CartItem = {
      id: Date.now().toString(),
      type: product.type,
      name: product.name,
      price: product.type === 'FABRIC' ? product.sellingPrice * meters : product.sellingPrice,
      quantity: product.type === 'FABRIC' ? meters : 1,
      meters: product.type === 'FABRIC' ? meters : undefined,
      pricePerMeter: product.type === 'FABRIC' ? product.sellingPrice : undefined,
      needsTailoring: false,
      tailoringCost: 0,
      productId: product.id,
      barcode: product.barcode
    };

    setCart([...cart, cartItem]);
    toast({
      title: "Added to Cart",
      description: `${product.name} added successfully`,
    });
  };

  const addFabricToCart = (fabricName: string, meters: number, pricePerMeter: number) => {
    const cartItem: CartItem = {
      id: Date.now().toString(),
      type: 'FABRIC',
      name: fabricName,
      price: pricePerMeter * meters,
      quantity: 1,
      meters,
      pricePerMeter,
      needsTailoring: false,
      tailoringCost: 0
    };

    setCart([...cart, cartItem]);
    toast({
      title: "Fabric Added",
      description: `${meters}m of ${fabricName} added to cart`,
    });
  };

  const updateTailoring = (itemId: string, needsTailoring: boolean, cost = 200) => {
    setCart(cart.map(item =>
      item.id === itemId
        ? { ...item, needsTailoring, tailoringCost: needsTailoring ? cost : 0 }
        : item
    ));

    if (needsTailoring) {
      setShowMeasurements(true);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item removed from cart",
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price + item.tailoringCost, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  // Customer handling functions
  const handleCustomerInputChange = (field: keyof CustomerInfo, value: string) => {
    const updatedCustomer = { ...customer, [field]: value };
    setCustomer(updatedCustomer);

    // Create search query from available customer data
    const searchQuery = [
      updatedCustomer.name,
      updatedCustomer.phone,
      updatedCustomer.email
    ].filter(Boolean).join(' ').trim();

    setCustomerSearchQuery(searchQuery);

    // Show dropdown if we have enough data to search and no existing customer is selected
    if (searchQuery.length >= 2 && !updatedCustomer.customerId) {
      setShowCustomerDropdown(true);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectExistingCustomer = (selectedCustomer: Customer) => {
    setCustomer({
      name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      phone: selectedCustomer.phone || '',
      email: selectedCustomer.email || '',
      address: selectedCustomer.address || '',
      customerId: selectedCustomer.id
    });
    setShowCustomerDropdown(false);
    setCustomerSearchQuery('');

    toast({
      title: "Customer Selected",
      description: `Selected existing customer: ${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
    });
  };

  const handleAddNewCustomer = () => {
    setShowCustomerDropdown(false);
    setCustomerSearchQuery('');
    // Clear the customerId to allow creating a new customer
    setCustomer(prev => ({ ...prev, customerId: undefined }));
  };

  const generateInvoice = async () => {
    if (!customer.name || !customer.phone) {
      toast({
        title: "Missing Information",
        description: "Please enter customer name and phone number",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before generating invoice",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Create or find customer
      let customerId = customer.customerId;
      if (!customerId) {
        // Split name properly - if only one word, use it as firstName and set lastName to a default
        const nameParts = customer.name.trim().split(' ').filter(part => part.length > 0);
        const customerData = {
          firstName: nameParts[0] || customer.name,
          lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer', // Default lastName for single names
          email: customer.email && customer.email.trim() ? customer.email : undefined,
          phone: customer.phone,
          address: customer.address && customer.address.trim() ? customer.address : undefined
        };

        console.log('Creating customer with data:', customerData);

        const customerResponse = await customerApi.createCustomer(customerData);
        customerId = customerResponse.data.customer.id;
      }

      // Create bill
      const billData = {
        customerId,
        items: cart.map(item => {
          const product = products.find(p => p.id === item.productId);
          const itemTotal = item.price + item.tailoringCost;
          return {
            productId: item.productId,
            customName: item.name,
            quantity: item.quantity,
            unit: product?.unit || 'PCS',
            unitPrice: item.price / item.quantity,
            totalPrice: itemTotal,
            discount: 0,
            isTailoring: item.needsTailoring,
            tailoringPrice: item.tailoringCost,
            notes: item.meters ? `${item.meters} meters` : undefined
          };
        }),
        discountAmount,
        taxAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        notes: showMeasurements ? `Measurements: ${JSON.stringify(measurements)}` : undefined
      };

      const billResponse = await billApi.createBill(billData);

      // Store the generated bill and customer phone for WhatsApp sending
      setLastGeneratedBill(billResponse.data.bill);
      setLastCustomerPhone(customer.phone);

      toast({
        title: "Invoice Generated",
        description: `Invoice ${billResponse.data.bill.billNumber} created successfully`,
      });

      // Clear cart and reset form
      setCart([]);
      setCustomer({ name: "", phone: "", email: "", address: "" });
      setMeasurements({
        chest: "", waist: "", hip: "", shoulder: "", sleeve: "",
        length: "", inseam: "", neck: "", notes: ""
      });
      setShowMeasurements(false);
      setDiscount(0);

    } catch (error: any) {
      console.error('Error generating invoice:', error);

      // Extract specific error message from the response
      let errorMessage = "Failed to generate invoice";
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeInput = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      try {
        const response = await productApi.getProductByBarcode(barcodeInput);
        const product = response.data.product;

        if (product.type === 'FABRIC') {
          const meters = prompt("Enter meters required:");
          if (meters && !isNaN(Number(meters))) {
            addToCart(product, Number(meters));
          }
        } else {
          addToCart(product);
        }
        setBarcodeInput("");
      } catch (error) {
        toast({
          title: "Product Not Found",
          description: "Barcode not found in inventory",
          variant: "destructive"
        });
      }
    }
  };

  const sendWhatsApp = async () => {
    if (!lastGeneratedBill) {
      toast({
        title: "No Invoice",
        description: "Please generate an invoice first",
        variant: "destructive"
      });
      return;
    }

    if (!lastCustomerPhone) {
      toast({
        title: "No Phone Number",
        description: "Customer phone number not available",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await billApi.sendInvoiceWhatsApp(
        lastGeneratedBill.id,
        lastCustomerPhone
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
          title: "Sent Successfully",
          description: `Invoice sent to ${lastCustomerPhone} via WhatsApp`,
        });
      }

      // Clear the last generated bill and phone after sending
      setLastGeneratedBill(null);
      setLastCustomerPhone("");
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error?.message || "Failed to send invoice via WhatsApp",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fabricProducts = products.filter(p => p.type === 'FABRIC');
  const garmentProducts = products.filter(p => p.type === 'READY_MADE');
  const accessoryProducts = products.filter(p => p.type === 'ACCESSORY');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        {/* Barcode Scanner */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Barcode Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Scan or type barcode..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={handleBarcodeInput}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Quick Add Fabric */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ruler className="w-5 h-5" />
              <span>Add Fabric by Meter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Fabric Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select fabric" />
                </SelectTrigger>
                <SelectContent>
                  {fabricProducts.map((fabric) => (
                    <SelectItem key={fabric.id} value={fabric.id}>
                      {fabric.name} - ₹{fabric.sellingPrice}/m
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meters Required</Label>
              <Input type="number" placeholder="2.5" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                className="w-full primary-gradient text-white"
                onClick={() => {
                  if (fabricProducts.length > 0) {
                    addFabricToCart(fabricProducts[0].name, 2.5, fabricProducts[0].sellingPrice);
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ready-made Products */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle>Ready-made Garments & Accessories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...garmentProducts, ...accessoryProducts].map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center space-y-2 hover:accent-gradient hover:text-white"
                  onClick={() => addToCart(product)}
                >
                  <Scissors className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{product.sellingPrice}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Billing */}
      <div className="space-y-4">
        {/* Customer Information */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 relative">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customer.name}
                onChange={(e) => handleCustomerInputChange('name', e.target.value)}
                placeholder="Enter full name (e.g., John Doe)"
              />
              <p className="text-xs text-muted-foreground">
                Enter the customer's full name. Matching existing customers will appear below.
              </p>
              <CustomerDropdown
                searchQuery={customerSearchQuery}
                onSelectCustomer={handleSelectExistingCustomer}
                onAddNewCustomer={handleAddNewCustomer}
                isVisible={showCustomerDropdown}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={customer.phone}
                onChange={(e) => handleCustomerInputChange('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => handleCustomerInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={customer.address}
                  onChange={(e) => handleCustomerInputChange('address', e.target.value)}
                  placeholder="City"
                />
              </div>
            </div>
            {customer.customerId && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-700 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Using existing customer profile
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomer(prev => ({ ...prev, customerId: undefined }))}
                    className="text-green-600 hover:text-green-800 h-auto p-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopping Cart */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
              </div>
              <Badge variant="secondary">₹{total.toFixed(2)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No items in cart
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.type === 'FABRIC'
                          ? `${item.meters}m × ₹${item.pricePerMeter}/m`
                          : `₹${item.price}`
                        }
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {(item.type === 'FABRIC' || item.type === 'READY_MADE') && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Scissors className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor={`tailoring-${item.id}`} className="text-sm">
                          Add Tailoring (₹200)
                        </Label>
                      </div>
                      <Switch
                        id={`tailoring-${item.id}`}
                        checked={item.needsTailoring}
                        onCheckedChange={(checked) => updateTailoring(item.id, checked)}
                      />
                    </div>
                  )}

                  <div className="text-right font-medium">
                    ₹{(item.price + item.tailoringCost).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card className="pos-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>Bill Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount ({discount}%):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST ({tax}%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-4 h-4" />
                        <span>Cash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="upi">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4" />
                        <span>UPI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Card</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                className="w-full primary-gradient text-white"
                onClick={generateInvoice}
                disabled={cart.length === 0 || loading}
              >
                <Printer className="w-4 h-4 mr-2" />
                {loading ? "Processing..." : "Generate Invoice"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={sendWhatsApp}
                disabled={!lastGeneratedBill || loading}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Send on WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Measurements */}
        {showMeasurements && (
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="w-5 h-5" />
                <span>Customer Measurements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Chest</Label>
                <Input
                  value={measurements.chest}
                  onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                  placeholder="38"
                />
              </div>
              <div className="space-y-2">
                <Label>Waist</Label>
                <Input
                  value={measurements.waist}
                  onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                  placeholder="32"
                />
              </div>
              <div className="space-y-2">
                <Label>Shoulder</Label>
                <Input
                  value={measurements.shoulder}
                  onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                  placeholder="16"
                />
              </div>
              <div className="space-y-2">
                <Label>Sleeve</Label>
                <Input
                  value={measurements.sleeve}
                  onChange={(e) => setMeasurements({ ...measurements, sleeve: e.target.value })}
                  placeholder="24"
                />
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <Input
                  value={measurements.length}
                  onChange={(e) => setMeasurements({ ...measurements, length: e.target.value })}
                  placeholder="42"
                />
              </div>
              <div className="space-y-2">
                <Label>Neck</Label>
                <Input
                  value={measurements.neck}
                  onChange={(e) => setMeasurements({ ...measurements, neck: e.target.value })}
                  placeholder="15.5"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Special Notes</Label>
                <Textarea
                  value={measurements.notes}
                  onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
