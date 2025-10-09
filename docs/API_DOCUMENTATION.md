# API Documentation

This document provides comprehensive API documentation for the Clothing Store Billing & Inventory System.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": "Additional error details"
  }
}
```

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@clothingstore.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_001",
      "email": "admin@clothingstore.com",
      "username": "admin",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Login successful"
}
```

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "newuser@clothingstore.com",
  "username": "newuser",
  "password": "NewUser123!",
  "firstName": "New",
  "lastName": "User",
  "role": "STAFF"
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout

Logout current user.

**Headers:** `Authorization: Bearer <token>`

### GET /auth/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

### PUT /auth/profile

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@clothingstore.com"
}
```

## Product Endpoints

### GET /products

Get all products with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term
- `categoryId` (string): Filter by category
- `type` (string): Filter by product type
- `isActive` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_001",
        "name": "Cotton Shirt",
        "sku": "SHIRT-001",
        "barcode": "123456789012",
        "category": {
          "id": "cat_001",
          "name": "Shirts"
        },
        "type": "READY_MADE",
        "unit": "piece",
        "basePrice": 500,
        "sellingPrice": 800,
        "costPrice": 400,
        "minStock": 10,
        "isActive": true,
        "isTailoring": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /products/:id

Get product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_001",
      "name": "Cotton Shirt",
      "sku": "SHIRT-001",
      "barcode": "123456789012",
      "category": {
        "id": "cat_001",
        "name": "Shirts"
      },
      "type": "READY_MADE",
      "unit": "piece",
      "basePrice": 500,
      "sellingPrice": 800,
      "costPrice": 400,
      "minStock": 10,
      "maxStock": 100,
      "isActive": true,
      "isTailoring": false,
      "tailoringPrice": null,
      "imageUrl": "https://example.com/image.jpg",
      "specifications": {
        "color": "Blue",
        "size": "M",
        "material": "Cotton"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### GET /products/barcode/:barcode

Get product by barcode.

### POST /products

Create new product.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "sku": "NEW-001",
  "categoryId": "cat_001",
  "type": "READY_MADE",
  "unit": "piece",
  "basePrice": 500,
  "sellingPrice": 800,
  "costPrice": 400,
  "minStock": 10,
  "maxStock": 100,
  "isTailoring": false,
  "tailoringPrice": null,
  "imageUrl": "https://example.com/image.jpg",
  "specifications": {
    "color": "Red",
    "size": "L"
  }
}
```

### PUT /products/:id

Update product.

**Headers:** `Authorization: Bearer <token>`

### DELETE /products/:id

Delete product (soft delete).

**Headers:** `Authorization: Bearer <token>`

### GET /products/category/:categoryId

Get products by category.

### GET /products/type/:type

Get products by type.

### GET /products/low-stock

Get products with low stock.

**Headers:** `Authorization: Bearer <token>`

### GET /products/search/:query

Search products.

**Query Parameters:**
- `categoryId` (string): Filter by category
- `type` (string): Filter by type
- `limit` (number): Max results (default: 20)

### GET /products/stats/overview

Get product statistics.

**Headers:** `Authorization: Bearer <token>`

### POST /products/:id/regenerate-barcode

Regenerate product barcode.

**Headers:** `Authorization: Bearer <token>`

## Customer Endpoints

### GET /customers

Get all customers with pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `isActive` (boolean): Filter by active status

### GET /customers/:id

Get customer by ID.

### POST /customers

Create new customer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "9876543210",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE"
}
```

### PUT /customers/:id

Update customer.

**Headers:** `Authorization: Bearer <token>`

### DELETE /customers/:id

Delete customer (soft delete).

**Headers:** `Authorization: Bearer <token>`

### GET /customers/search/:query

Search customers.

### GET /customers/:id/measurements

Get customer measurements.

### POST /customers/:id/measurements

Add customer measurement.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Shirt Template",
  "measurements": {
    "chest": 40,
    "waist": 36,
    "length": 30,
    "sleeve": 24
  },
  "notes": "Regular fit"
}
```

### PUT /customers/:id/measurements/:measurementId

Update customer measurement.

**Headers:** `Authorization: Bearer <token>`

### DELETE /customers/:id/measurements/:measurementId

Delete customer measurement.

**Headers:** `Authorization: Bearer <token>`

### GET /customers/:id/bills

Get customer bills.

### GET /customers/stats/overview

Get customer statistics.

**Headers:** `Authorization: Bearer <token>`

## Bill Endpoints

### GET /bills

Get all bills with pagination and filters.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `customerId` (string): Filter by customer
- `status` (string): Filter by bill status
- `paymentStatus` (string): Filter by payment status
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)

### GET /bills/:id

Get bill by ID.

### POST /bills

Create new bill.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "customerId": "cust_001",
  "items": [
    {
      "productId": "prod_001",
      "customName": null,
      "description": "Blue cotton shirt",
      "quantity": 2,
      "unit": "piece",
      "unitPrice": 800,
      "totalPrice": 1600,
      "discount": 0,
      "isTailoring": false,
      "tailoringPrice": null,
      "measurements": null,
      "notes": null
    }
  ],
  "discountAmount": 200,
  "taxAmount": 252,
  "paymentMethod": "CASH",
  "notes": "Customer requested quick delivery",
  "deliveryDate": "2024-01-15T00:00:00Z"
}
```

### PUT /bills/:id

Update bill.

**Headers:** `Authorization: Bearer <token>`

### POST /bills/:id/cancel

Cancel bill.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

### GET /bills/:id/invoice

Generate invoice PDF.

**Query Parameters:**
- `format` (string): pdf or html (default: pdf)

### POST /bills/:id/send-whatsapp

Send invoice via WhatsApp.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "phoneNumber": "9876543210",
  "message": "Your invoice is ready. Thank you for your business!"
}
```

### POST /bills/:id/payments

Add payment to bill.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 1000,
  "method": "CASH",
  "reference": "CASH001",
  "notes": "Partial payment"
}
```

### GET /bills/:id/payments

Get bill payments.

### GET /bills/stats/overview

Get bill statistics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom` (string): Filter from date
- `dateTo` (string): Filter to date

### GET /bills/reports/daily-sales

Get daily sales report.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date` (string): Date (default: today)

## Inventory Endpoints

### GET /inventory

Get inventory records with pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `productId` (string): Filter by product
- `type` (string): Filter by inventory type

### POST /inventory

Add inventory record.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "prod_001",
  "quantity": 50,
  "type": "IN",
  "reference": "Purchase Order 001",
  "notes": "New stock received"
}
```

### GET /inventory/product/:productId/stock

Get product stock summary.

### GET /inventory/stats/overview

Get inventory statistics.

**Headers:** `Authorization: Bearer <token>`

## Category Endpoints

### GET /categories

Get all categories.

### GET /categories/:id

Get category by ID.

### POST /categories

Create new category.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

### PUT /categories/:id

Update category.

**Headers:** `Authorization: Bearer <token>`

### DELETE /categories/:id

Delete category.

**Headers:** `Authorization: Bearer <token>`

## User Endpoints

### GET /users

Get all users with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status

### GET /users/:id

Get user by ID.

**Headers:** `Authorization: Bearer <token>`

### POST /users

Create new user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newuser@clothingstore.com",
  "username": "newuser",
  "password": "NewUser123!",
  "firstName": "New",
  "lastName": "User",
  "role": "STAFF"
}
```

### PUT /users/:id

Update user.

**Headers:** `Authorization: Bearer <token>`

### DELETE /users/:id

Delete user (soft delete).

**Headers:** `Authorization: Bearer <token>`

### GET /users/search/:query

Search users.

**Headers:** `Authorization: Bearer <token>`

### GET /users/stats/overview

Get user statistics.

**Headers:** `Authorization: Bearer <token>`

## Barcode Endpoints

### POST /barcodes/generate

Generate barcode image.

**Request Body:**
```json
{
  "text": "123456789012",
  "format": "CODE128",
  "width": 2,
  "height": 100,
  "scale": 3,
  "includetext": true
}
```

### POST /barcodes/generate/svg

Generate barcode as SVG.

### POST /barcodes/generate/dataurl

Generate barcode as data URL.

### POST /barcodes/generate/label

Generate barcode label.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "123456789012",
  "format": "CODE128",
  "productName": "Cotton Shirt",
  "price": 800,
  "sku": "SHIRT-001",
  "width": 200,
  "height": 100
}
```

### GET /barcodes/formats

Get supported barcode formats.

### POST /barcodes/scan

Scan barcode from image.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "image": "base64-encoded-image-data"
}
```

## Report Endpoints

### GET /reports/sales

Get sales report.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom` (string): Filter from date
- `dateTo` (string): Filter to date
- `groupBy` (string): day, week, month, year

### GET /reports/inventory

Get inventory report.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `categoryId` (string): Filter by category
- `lowStock` (boolean): Show only low stock items

### GET /reports/customers

Get customer report.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom` (string): Filter from date
- `dateTo` (string): Filter to date
- `topCustomers` (number): Number of top customers

### GET /reports/products/performance

Get product performance report.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom` (string): Filter from date
- `dateTo` (string): Filter to date
- `topProducts` (number): Number of top products

### GET /reports/dashboard

Get dashboard overview data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `dateFrom` (string): Filter from date
- `dateTo` (string): Filter to date

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are rate limited to prevent abuse:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP
- **File Upload**: 10 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

The system supports webhooks for real-time notifications:

### Bill Created Webhook

**URL:** `POST /webhooks/bill-created`

**Payload:**
```json
{
  "event": "bill.created",
  "data": {
    "billId": "bill_001",
    "billNumber": "CS241201001",
    "customerId": "cust_001",
    "totalAmount": 2000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Low Stock Alert Webhook

**URL:** `POST /webhooks/low-stock`

**Payload:**
```json
{
  "event": "inventory.low-stock",
  "data": {
    "productId": "prod_001",
    "productName": "Cotton Shirt",
    "currentStock": 5,
    "minStock": 10
  }
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const token = response.data.data.tokens.accessToken;
  api.defaults.headers.Authorization = `Bearer ${token}`;
  return response.data;
};

// Get products
const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Create bill
const createBill = async (billData) => {
  const response = await api.post('/bills', billData);
  return response.data;
};
```

### Python

```python
import requests

class ClothingStoreAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f"{self.base_url}/auth/login", json={
            "email": email,
            "password": password
        })
        data = response.json()
        self.token = data['data']['tokens']['accessToken']
        return data
    
    def get_products(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/products", headers=headers)
        return response.json()
    
    def create_bill(self, bill_data):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/bills", json=bill_data, headers=headers)
        return response.json()

# Usage
api = ClothingStoreAPI("http://localhost:5000/api")
api.login("admin@clothingstore.com", "Admin123!")
products = api.get_products()
```

This API documentation provides comprehensive information for integrating with the Clothing Store Billing & Inventory System. For additional support or questions, please refer to the installation and usage guides.
