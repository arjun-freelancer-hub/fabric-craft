'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { productApi, Product } from "@/lib/api";
import {
    Plus,
    Edit,
    Trash2,
    Package,
    Palette,
    Ruler,
    Search,
    Filter,
    QrCode,
    Tags
} from "lucide-react";

export const ProductCatalog = () => {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: "",
        type: "FABRIC",
        category: { id: "", name: "" },
        basePrice: 0,
        sellingPrice: 0,
        costPrice: 0,
        unit: "meter",
        stock: 0,
        barcode: "",
        description: "",
        sku: "",
        isActive: true,
        isTailoring: false,
        createdBy: ""
    });

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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === "all" || product.type.toLowerCase() === filterType.toLowerCase();
        const matchesCategory = filterCategory === "all" || product.category.name === filterCategory;

        return matchesSearch && matchesType && matchesCategory;
    });

    const categories = Array.from(new Set(products.map(p => p.category.name)));

    const generateBarcode = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${random}${timestamp}`;
    };

    const addProduct = async () => {
        if (!newProduct.name || !newProduct.category?.name) {
            toast({
                title: "Missing Information",
                description: "Please fill in required fields",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const response = await productApi.createProduct({
                ...newProduct,
                barcode: newProduct.barcode || generateBarcode(),
                sku: newProduct.sku || generateBarcode(),
                isActive: true
            });

            setProducts([...products, response.data.product]);
            setNewProduct({
                name: "",
                type: "FABRIC",
                category: { id: "", name: "" },
                basePrice: 0,
                sellingPrice: 0,
                costPrice: 0,
                unit: "meter",
                stock: 0,
                barcode: "",
                description: "",
                sku: "",
                isActive: true,
                isTailoring: false,
                createdBy: ""
            });
            setShowAddForm(false);

            toast({
                title: "Product Added",
                description: "Product successfully added to catalog",
            });
        } catch (error) {
            console.error('Error adding product:', error);
            toast({
                title: "Error",
                description: "Failed to add product",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async () => {
        if (!editingProduct) return;

        try {
            setLoading(true);
            const response = await productApi.updateProduct(editingProduct.id, editingProduct);

            setProducts(products.map(p => p.id === editingProduct.id ? response.data.product : p));
            setEditingProduct(null);

            toast({
                title: "Product Updated",
                description: "Product successfully updated",
            });
        } catch (error) {
            console.error('Error updating product:', error);
            toast({
                title: "Error",
                description: "Failed to update product",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            setLoading(true);
            await productApi.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast({
                title: "Product Deleted",
                description: "Product removed from catalog",
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="pos-card">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products, barcodes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="FABRIC">Fabrics</SelectItem>
                                <SelectItem value="READY_MADE">Ready Made</SelectItem>
                                <SelectItem value="ACCESSORY">Accessories</SelectItem>
                                <SelectItem value="TAILORING_SERVICE">Tailoring Services</SelectItem>
                                <SelectItem value="CUSTOM">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            className="primary-gradient text-white"
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Add Product Form */}
            {showAddForm && (
                <Card className="pos-card">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Add New Product</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Product Name *</Label>
                                <Input
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="Product name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type *</Label>
                                <Select
                                    value={newProduct.type}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FABRIC">Fabric</SelectItem>
                                        <SelectItem value="READY_MADE">Ready Made</SelectItem>
                                        <SelectItem value="ACCESSORY">Accessory</SelectItem>
                                        <SelectItem value="TAILORING_SERVICE">Tailoring Service</SelectItem>
                                        <SelectItem value="CUSTOM">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Input
                                    value={newProduct.category?.name || ""}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: { id: "", name: e.target.value } })}
                                    placeholder="Category"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Base Price</Label>
                                <Input
                                    type="number"
                                    value={newProduct.basePrice}
                                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: Number(e.target.value) })}
                                    placeholder="100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Selling Price</Label>
                                <Input
                                    type="number"
                                    value={newProduct.sellingPrice}
                                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                                    placeholder="150"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cost Price</Label>
                                <Input
                                    type="number"
                                    value={newProduct.costPrice}
                                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
                                    placeholder="80"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select
                                    value={newProduct.unit}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meter">Meter</SelectItem>
                                        <SelectItem value="piece">Piece</SelectItem>
                                        <SelectItem value="kg">Kilogram</SelectItem>
                                        <SelectItem value="yard">Yard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Barcode</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={newProduct.barcode}
                                        onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                                        placeholder="Auto-generated"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => setNewProduct({ ...newProduct, barcode: generateBarcode() })}
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    placeholder="Product SKU"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Product description"
                                rows={3}
                            />
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                className="primary-gradient text-white"
                                onClick={addProduct}
                                disabled={loading}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {loading ? "Adding..." : "Add Product"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="pos-card hover:fabric-shadow transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{product.name}</CardTitle>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Badge
                                            variant="secondary"
                                            className={
                                                product.type === 'FABRIC' ? 'bg-blue-100 text-blue-800' :
                                                    product.type === 'READY_MADE' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                            }
                                        >
                                            {product.type}
                                        </Badge>
                                        <Badge variant="outline">{product.category.name}</Badge>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingProduct(product)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteProduct(product.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Price:</span>
                                    <div className="font-medium">
                                        ₹{product.sellingPrice}/{product.unit}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Stock:</span>
                                    <div className={`font-medium ${(product.stock || 0) < 10 ? 'text-destructive' : 'text-success'}`}>
                                        {product.stock || 0} {product.unit}s
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">SKU:</span>
                                    <div className="font-medium">{product.sku}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Barcode:</span>
                                    <div className="font-mono text-xs">{product.barcode || 'N/A'}</div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="text-sm text-muted-foreground">
                                    {product.description.length > 60
                                        ? `${product.description.substring(0, 60)}...`
                                        : product.description
                                    }
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground border-t border-border pt-2">
                                Type: {product.type} | Unit: {product.unit}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Edit className="w-5 h-5" />
                                <span>Edit Product</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Product Name</Label>
                                    <Input
                                        value={editingProduct.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        value={editingProduct.category?.name || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: { ...editingProduct.category, name: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Selling Price</Label>
                                    <Input
                                        type="number"
                                        value={editingProduct.sellingPrice}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        value={editingProduct.stock}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Input
                                        value={editingProduct.unit}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingProduct.description}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button
                                    className="primary-gradient text-white"
                                    onClick={updateProduct}
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update Product"}
                                </Button>
                                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
                <Card className="pos-card">
                    <CardContent className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No products found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? "Try adjusting your search criteria" : "Start by adding your first product"}
                        </p>
                        {!searchTerm && (
                            <Button
                                className="primary-gradient text-white"
                                onClick={() => setShowAddForm(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Product
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
