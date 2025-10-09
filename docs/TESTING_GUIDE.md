# Testing Guide

This guide provides comprehensive testing procedures for the Clothing Store Billing & Inventory System, including manual test cases, automated testing setup, and sample data for testing.

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Automated Testing](#automated-testing)
3. [Sample Data](#sample-data)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Integration Testing](#integration-testing)

## Manual Testing

### Test Environment Setup

#### Prerequisites

1. Fresh installation of the system
2. Database with sample data
3. Test user accounts with different roles
4. Sample products and customers
5. Test payment methods configured

#### Test Data Preparation

```sql
-- Sample Categories
INSERT INTO categories (id, name, description, isActive) VALUES
('cat_001', 'Shirts', 'All types of shirts', true),
('cat_002', 'Pants', 'Trousers and pants', true),
('cat_003', 'Dresses', 'Women dresses', true),
('cat_004', 'Fabrics', 'Raw fabrics for tailoring', true);

-- Sample Products
INSERT INTO products (id, name, sku, categoryId, type, unit, basePrice, sellingPrice, costPrice, minStock, isActive) VALUES
('prod_001', 'Cotton Shirt', 'SHIRT-001', 'cat_001', 'READY_MADE', 'piece', 500, 800, 400, 10, true),
('prod_002', 'Cotton Fabric', 'FABRIC-001', 'cat_004', 'FABRIC', 'meter', 200, 300, 150, 50, true),
('prod_003', 'Denim Jeans', 'JEANS-001', 'cat_002', 'READY_MADE', 'piece', 800, 1200, 600, 5, true);

-- Sample Customers
INSERT INTO customers (id, firstName, lastName, email, phone, address, city, isActive) VALUES
('cust_001', 'John', 'Doe', 'john.doe@email.com', '9876543210', '123 Main St', 'Mumbai', true),
('cust_002', 'Jane', 'Smith', 'jane.smith@email.com', '9876543211', '456 Oak Ave', 'Delhi', true);
```

### Authentication Testing

#### Test Case 1: User Login

**Objective**: Verify user can login with valid credentials

**Steps**:
1. Navigate to login page
2. Enter valid email and password
3. Click "Sign In" button

**Expected Result**: User successfully logged in and redirected to dashboard

**Test Data**:
- Email: admin@clothingstore.com
- Password: Admin123!

#### Test Case 2: Invalid Login

**Objective**: Verify system handles invalid credentials

**Steps**:
1. Navigate to login page
2. Enter invalid email or password
3. Click "Sign In" button

**Expected Result**: Error message displayed, user remains on login page

#### Test Case 3: Password Visibility Toggle

**Objective**: Verify password visibility can be toggled

**Steps**:
1. Navigate to login page
2. Enter password
3. Click eye icon to toggle visibility

**Expected Result**: Password text becomes visible/hidden

### Product Management Testing

#### Test Case 4: Add New Product

**Objective**: Verify new product can be added successfully

**Steps**:
1. Login as Manager/Admin
2. Navigate to Products → Add Product
3. Fill in product details:
   - Name: "Test Shirt"
   - Category: "Shirts"
   - Type: "Ready-made"
   - Unit: "piece"
   - Base Price: 500
   - Selling Price: 800
   - Cost Price: 400
   - Min Stock: 10
4. Click "Save Product"

**Expected Result**: Product created successfully, redirected to product list

#### Test Case 5: Edit Product

**Objective**: Verify product details can be updated

**Steps**:
1. Navigate to product list
2. Click on existing product
3. Click "Edit" button
4. Update selling price to 900
5. Click "Update Product"

**Expected Result**: Product updated successfully, new price reflected

#### Test Case 6: Delete Product

**Objective**: Verify product can be soft deleted

**Steps**:
1. Navigate to product list
2. Click on product to delete
3. Click "Delete" button
4. Confirm deletion

**Expected Result**: Product marked as inactive, not visible in active products list

### Inventory Management Testing

#### Test Case 7: Add Stock

**Objective**: Verify stock can be added to products

**Steps**:
1. Navigate to Inventory → Stock Management
2. Select product "Cotton Shirt"
3. Click "Add Stock"
4. Enter quantity: 50
5. Select type: "IN"
6. Add reference: "Purchase Order 001"
7. Click "Add Stock"

**Expected Result**: Stock added successfully, product quantity updated

#### Test Case 8: Stock Adjustment

**Objective**: Verify stock adjustments work correctly

**Steps**:
1. Navigate to product with existing stock
2. Click "Adjust Stock"
3. Enter adjustment quantity: -5
4. Add reason: "Damaged items"
5. Click "Adjust"

**Expected Result**: Stock reduced by 5, adjustment recorded

### Customer Management Testing

#### Test Case 9: Add New Customer

**Objective**: Verify new customer can be registered

**Steps**:
1. Navigate to Customers → Add Customer
2. Fill in customer details:
   - First Name: "Alice"
   - Last Name: "Johnson"
   - Email: "alice.johnson@email.com"
   - Phone: "9876543212"
   - Address: "789 Pine St"
   - City: "Bangalore"
3. Click "Save Customer"

**Expected Result**: Customer created successfully, added to customer list

#### Test Case 10: Add Customer Measurements

**Objective**: Verify customer measurements can be stored

**Steps**:
1. Navigate to customer profile
2. Click "Add Measurement"
3. Enter template name: "Shirt Template"
4. Add measurements:
   - Chest: 40
   - Waist: 36
   - Length: 30
5. Click "Save Measurement"

**Expected Result**: Measurement template saved, available for future orders

### Billing System Testing

#### Test Case 11: Create New Bill

**Objective**: Verify new bill can be created successfully

**Steps**:
1. Navigate to Bills → New Bill
2. Select customer "John Doe"
3. Add products:
   - Cotton Shirt: Quantity 2, Price 800 each
   - Cotton Fabric: 3 meters, Price 300 per meter
4. Apply 10% discount
5. Select payment method: "Cash"
6. Click "Create Bill"

**Expected Result**: Bill created successfully, invoice generated

#### Test Case 12: Bill with Tailoring

**Objective**: Verify tailoring charges are calculated correctly

**Steps**:
1. Create new bill
2. Add fabric product with tailoring enabled
3. Select customer measurement template
4. Add tailoring charges: 500
5. Complete bill

**Expected Result**: Tailoring charges added to total, measurements displayed on invoice

#### Test Case 13: Partial Payment

**Objective**: Verify partial payments are handled correctly

**Steps**:
1. Create bill with total amount 2000
2. Add payment: 1000 (Cash)
3. Mark payment status as "Partial"
4. Add second payment: 1000 (UPI)
5. Update payment status to "Completed"

**Expected Result**: Payment history updated, bill marked as paid

### Barcode Testing

#### Test Case 14: Generate Barcode

**Objective**: Verify barcode generation works correctly

**Steps**:
1. Navigate to product details
2. Click "Generate Barcode"
3. Select format: "CODE128"
4. Click "Generate"

**Expected Result**: Barcode generated and displayed

#### Test Case 15: Print Barcode Label

**Objective**: Verify barcode labels can be printed

**Steps**:
1. Generate barcode for product
2. Click "Print Label"
3. Configure label settings
4. Click "Print"

**Expected Result**: Barcode label printed successfully

### Report Testing

#### Test Case 16: Sales Report

**Objective**: Verify sales reports are generated correctly

**Steps**:
1. Navigate to Reports → Sales Report
2. Select date range: Last 7 days
3. Click "Generate Report"

**Expected Result**: Sales report displayed with correct data

#### Test Case 17: Inventory Report

**Objective**: Verify inventory reports show accurate stock levels

**Steps**:
1. Navigate to Reports → Inventory Report
2. Select "Low Stock" filter
3. Click "Generate Report"

**Expected Result**: Products with low stock displayed

## Automated Testing

### Backend Testing

#### Setup Jest for Backend

```bash
cd backend
npm install --save-dev jest @types/jest ts-jest supertest
```

#### Test Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

#### Sample Test Files

**tests/auth.test.ts**

```typescript
import request from 'supertest';
import app from '../src/index';

describe('Authentication', () => {
  test('POST /api/auth/login - should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@clothingstore.com',
        password: 'Admin123!'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.tokens).toBeDefined();
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@clothingstore.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

**tests/products.test.ts**

```typescript
import request from 'supertest';
import app from '../src/index';

describe('Products', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@clothingstore.com',
        password: 'Admin123!'
      });
    
    authToken = loginResponse.body.data.tokens.accessToken;
  });

  test('GET /api/products - should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });

  test('POST /api/products - should create new product', async () => {
    const productData = {
      name: 'Test Product',
      sku: 'TEST-001',
      categoryId: 'cat_001',
      type: 'READY_MADE',
      unit: 'piece',
      basePrice: 500,
      sellingPrice: 800,
      costPrice: 400,
      minStock: 10
    };

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(productData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.product.name).toBe('Test Product');
  });
});
```

### Frontend Testing

#### Setup Jest for Frontend

```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

#### Test Configuration (jest.config.js)

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<jest-setup.js>'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### Sample Test Files

**__tests__/components/Button.test.tsx**

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**__tests__/pages/login.test.tsx**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/app/auth/login/page';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Login Page', () => {
  test('renders login form', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });
});
```

### Running Tests

#### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts
```

#### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- Button.test.tsx
```

## Sample Data

### Test Users

```sql
-- Admin User
INSERT INTO users (id, email, username, password, firstName, lastName, role, isActive) VALUES
('user_001', 'admin@clothingstore.com', 'admin', '$2b$12$hash', 'Admin', 'User', 'ADMIN', true);

-- Manager User
INSERT INTO users (id, email, username, password, firstName, lastName, role, isActive) VALUES
('user_002', 'manager@clothingstore.com', 'manager', '$2b$12$hash', 'Manager', 'User', 'MANAGER', true);

-- Staff User
INSERT INTO users (id, email, username, password, firstName, lastName, role, isActive) VALUES
('user_003', 'staff@clothingstore.com', 'staff', '$2b$12$hash', 'Staff', 'User', 'STAFF', true);
```

### Test Products

```sql
-- Ready-made Products
INSERT INTO products (id, name, sku, categoryId, type, unit, basePrice, sellingPrice, costPrice, minStock, isActive) VALUES
('prod_001', 'Cotton Shirt', 'SHIRT-001', 'cat_001', 'READY_MADE', 'piece', 500, 800, 400, 10, true),
('prod_002', 'Denim Jeans', 'JEANS-001', 'cat_002', 'READY_MADE', 'piece', 800, 1200, 600, 5, true),
('prod_003', 'Summer Dress', 'DRESS-001', 'cat_003', 'READY_MADE', 'piece', 600, 1000, 450, 8, true);

-- Fabric Products
INSERT INTO products (id, name, sku, categoryId, type, unit, basePrice, sellingPrice, costPrice, minStock, isTailoring, tailoringPrice, isActive) VALUES
('prod_004', 'Cotton Fabric', 'FABRIC-001', 'cat_004', 'FABRIC', 'meter', 200, 300, 150, 50, true, 500, true),
('prod_005', 'Silk Fabric', 'FABRIC-002', 'cat_004', 'FABRIC', 'meter', 500, 800, 400, 20, true, 1000, true);

-- Accessories
INSERT INTO products (id, name, sku, categoryId, type, unit, basePrice, sellingPrice, costPrice, minStock, isActive) VALUES
('prod_006', 'Leather Belt', 'BELT-001', 'cat_005', 'ACCESSORY', 'piece', 200, 400, 150, 15, true),
('prod_007', 'Cotton Scarf', 'SCARF-001', 'cat_005', 'ACCESSORY', 'piece', 150, 300, 100, 20, true);
```

### Test Customers

```sql
INSERT INTO customers (id, firstName, lastName, email, phone, address, city, state, pincode, isActive) VALUES
('cust_001', 'John', 'Doe', 'john.doe@email.com', '9876543210', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', true),
('cust_002', 'Jane', 'Smith', 'jane.smith@email.com', '9876543211', '456 Oak Avenue', 'Delhi', 'Delhi', '110001', true),
('cust_003', 'Mike', 'Johnson', 'mike.johnson@email.com', '9876543212', '789 Pine Road', 'Bangalore', 'Karnataka', '560001', true),
('cust_004', 'Sarah', 'Wilson', 'sarah.wilson@email.com', '9876543213', '321 Elm Street', 'Chennai', 'Tamil Nadu', '600001', true);
```

### Test Bills

```sql
INSERT INTO bills (id, billNumber, customerId, totalAmount, discountAmount, taxAmount, finalAmount, paymentMethod, paymentStatus, status, createdBy) VALUES
('bill_001', 'CS241201001', 'cust_001', 2000, 200, 324, 2124, 'CASH', 'COMPLETED', 'ACTIVE', 'user_001'),
('bill_002', 'CS241201002', 'cust_002', 1500, 0, 270, 1770, 'UPI', 'COMPLETED', 'ACTIVE', 'user_001'),
('bill_003', 'CS241201003', 'cust_003', 3000, 300, 486, 3186, 'CARD', 'PENDING', 'ACTIVE', 'user_002');
```

## Performance Testing

### Load Testing with Artillery

#### Setup Artillery

```bash
npm install -g artillery
```

#### Load Test Configuration (load-test.yml)

```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Load Test"
    weight: 100
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@clothingstore.com"
            password: "Admin123!"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "token"
      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ token }}"
      - get:
          url: "/api/customers"
          headers:
            Authorization: "Bearer {{ token }}"
```

#### Run Load Test

```bash
artillery run load-test.yml
```

### Database Performance Testing

#### Test Queries

```sql
-- Test product search performance
EXPLAIN SELECT * FROM products WHERE name LIKE '%cotton%' AND isActive = true;

-- Test bill generation performance
EXPLAIN SELECT b.*, c.firstName, c.lastName 
FROM bills b 
LEFT JOIN customers c ON b.customerId = c.id 
WHERE b.createdAt >= '2024-01-01';

-- Test inventory aggregation
EXPLAIN SELECT p.name, SUM(i.quantity) as totalStock
FROM products p
LEFT JOIN inventory i ON p.id = i.productId
WHERE i.type = 'IN'
GROUP BY p.id, p.name;
```

## Security Testing

### Authentication Security

#### Test Cases

1. **SQL Injection**: Test all input fields for SQL injection
2. **XSS Prevention**: Test for cross-site scripting vulnerabilities
3. **CSRF Protection**: Verify CSRF tokens are implemented
4. **Session Management**: Test session timeout and invalidation
5. **Password Security**: Verify password hashing and complexity

#### Security Test Script

```javascript
// security-test.js
const request = require('supertest');
const app = require('../src/index');

describe('Security Tests', () => {
  test('should prevent SQL injection in login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "admin@clothingstore.com'; DROP TABLE users; --",
        password: 'password'
      });

    expect(response.status).toBe(401);
  });

  test('should prevent XSS in product name', async () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: maliciousInput,
        sku: 'TEST-001',
        categoryId: 'cat_001',
        type: 'READY_MADE',
        unit: 'piece',
        basePrice: 500,
        sellingPrice: 800,
        costPrice: 400
      });

    expect(response.status).toBe(400);
  });
});
```

## Integration Testing

### API Integration Tests

#### Test Complete Workflows

```typescript
describe('Complete Billing Workflow', () => {
  test('should create bill with products and payments', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@clothingstore.com',
        password: 'Admin123!'
      });
    
    const token = loginResponse.body.data.tokens.accessToken;

    // 2. Create bill
    const billResponse = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: 'cust_001',
        items: [
          {
            productId: 'prod_001',
            quantity: 2,
            unit: 'piece',
            unitPrice: 800,
            totalPrice: 1600
          }
        ],
        totalAmount: 1600,
        finalAmount: 1600,
        paymentMethod: 'CASH',
        paymentStatus: 'COMPLETED'
      });

    expect(billResponse.status).toBe(201);
    const billId = billResponse.body.data.bill.id;

    // 3. Generate invoice
    const invoiceResponse = await request(app)
      .get(`/api/bills/${billId}/invoice`)
      .set('Authorization', `Bearer ${token}`);

    expect(invoiceResponse.status).toBe(200);
  });
});
```

### Database Integration Tests

```typescript
describe('Database Integration', () => {
  test('should maintain data consistency across operations', async () => {
    // Test that inventory updates correctly when bill is created
    const initialStock = await getProductStock('prod_001');
    
    await createBillWithProduct('prod_001', 2);
    
    const finalStock = await getProductStock('prod_001');
    expect(finalStock).toBe(initialStock - 2);
  });
});
```

## Test Reporting

### Coverage Reports

#### Backend Coverage

```bash
cd backend
npm run test:coverage
```

#### Frontend Coverage

```bash
cd frontend
npm run test:coverage
```

### Test Results Dashboard

Create a simple HTML dashboard to display test results:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Results Dashboard</title>
    <style>
        .pass { color: green; }
        .fail { color: red; }
        .pending { color: orange; }
    </style>
</head>
<body>
    <h1>Test Results Dashboard</h1>
    <div id="test-results"></div>
    
    <script>
        // Display test results
        function displayTestResults(results) {
            const container = document.getElementById('test-results');
            results.forEach(test => {
                const div = document.createElement('div');
                div.className = test.status;
                div.textContent = `${test.name}: ${test.status}`;
                container.appendChild(div);
            });
        }
    </script>
</body>
</html>
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      - name: Run tests
        run: |
          cd backend
          npm test
      - name: Run coverage
        run: |
          cd backend
          npm run test:coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test
      - name: Run coverage
        run: |
          cd frontend
          npm run test:coverage
```

This comprehensive testing guide ensures the system is thoroughly tested across all components and scenarios. Regular testing helps maintain system quality and reliability.
