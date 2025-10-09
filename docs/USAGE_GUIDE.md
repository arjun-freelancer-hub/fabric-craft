# Usage Guide

This guide will help you understand how to use the Clothing Store Billing & Inventory System effectively.

## Getting Started

### 1. First Login

After installation, you'll need to create your first admin user:

1. Navigate to the registration page
2. Fill in your details with role "ADMIN"
3. Complete the registration process
4. Login with your credentials

### 2. Initial Setup

#### Create Categories

1. Go to **Products** → **Categories**
2. Click **Add Category**
3. Enter category name and description
4. Save the category

Example categories:
- Shirts
- Pants
- Dresses
- Accessories
- Fabrics

#### Add Products

1. Go to **Products** → **All Products**
2. Click **Add Product**
3. Fill in product details:
   - **Name**: Product name
   - **SKU**: Unique product code (auto-generated)
   - **Category**: Select from existing categories
   - **Type**: Choose from Fabric, Ready-made, Accessory, etc.
   - **Unit**: meter, piece, kg, etc.
   - **Prices**: Base price, selling price, cost price
   - **Stock**: Minimum and maximum stock levels
   - **Tailoring**: Enable if product requires tailoring

## Product Management

### Product Types

#### 1. Fabric Products

For fabric sold per meter:

1. Set **Type** to "Fabric"
2. Set **Unit** to "meter"
3. Set **Price per meter** in selling price
4. Enable **Tailoring** if custom tailoring is available
5. Set **Tailoring Price** if applicable

**Billing**: Price = (Price per meter × Meters required) + Tailoring charges

#### 2. Ready-made Products

For pre-made garments:

1. Set **Type** to "Ready-made"
2. Set **Unit** to "piece"
3. Set fixed selling price
4. Manage inventory stock

#### 3. Custom Products

For products added during billing:

1. Set **Type** to "Custom"
2. Enter custom name during billing
3. Set price at time of billing

### Inventory Management

#### Stock Tracking

1. **View Stock**: Go to **Inventory** → **Stock Overview**
2. **Add Stock**: Click **Add Stock** for any product
3. **Stock Types**:
   - **IN**: New stock received
   - **OUT**: Stock sold or used
   - **ADJUSTMENT**: Stock corrections
   - **RETURN**: Returned items

#### Low Stock Alerts

- System automatically alerts when stock falls below minimum level
- View low stock products in dashboard
- Set minimum stock levels for each product

### Barcode Management

#### Generate Barcodes

1. Go to **Products** → Select product
2. Click **Generate Barcode**
3. Choose barcode format:
   - **CODE128**: Most common, supports alphanumeric
   - **EAN13**: For retail products
   - **QR Code**: For detailed product information

#### Print Barcode Labels

1. Generate barcode for product
2. Click **Print Label**
3. Configure label size and content
4. Print on thermal or regular printer

#### Barcode Scanning

1. Use barcode scanner (keyboard wedge)
2. Scan barcode in product search
3. System automatically finds product
4. Add to bill or update inventory

## Customer Management

### Adding Customers

1. Go to **Customers** → **All Customers**
2. Click **Add Customer**
3. Fill in customer details:
   - Personal information
   - Contact details
   - Address information
   - Date of birth and gender

### Customer Measurements

#### Create Measurement Templates

1. Go to customer profile
2. Click **Add Measurement**
3. Enter template name (e.g., "Shirt Template")
4. Add measurements:
   - Chest, Waist, Length, etc.
   - Use standard measurement units
5. Save template

#### Use Measurements in Billing

1. Select customer during billing
2. Choose measurement template
3. Measurements appear on invoice
4. Tailoring charges calculated automatically

## Billing System

### Creating Bills

#### Step 1: Customer Selection

1. Go to **Bills** → **New Bill**
2. Search and select customer (optional)
3. Customer details auto-populate

#### Step 2: Add Products

1. **Search Products**: Use search bar or scan barcode
2. **Add Items**:
   - Select product from inventory
   - Enter quantity
   - System calculates total
   - Add custom products if needed

3. **Tailoring Items**:
   - Enable tailoring for fabric products
   - Select measurement template
   - Tailoring charges added automatically

#### Step 3: Calculate Totals

1. **Item Totals**: Quantity × Unit Price
2. **Discounts**: Apply item-level or bill-level discounts
3. **Tax**: GST/VAT calculated automatically
4. **Final Amount**: Total after all calculations

#### Step 4: Payment

1. **Payment Method**: Cash, UPI, Card, Netbanking
2. **Payment Status**: Pending, Partial, Completed
3. **Reference**: Transaction reference number

#### Step 5: Generate Invoice

1. Click **Generate Invoice**
2. Review invoice details
3. Print or save as PDF
4. Send via WhatsApp (optional)

### Invoice Management

#### Invoice Features

- **Bill Number**: Auto-generated unique number
- **Customer Details**: Name, address, contact
- **Itemized List**: Products, quantities, prices
- **Measurements**: Displayed for tailoring items
- **Payment Details**: Method, status, reference
- **Store Information**: Logo, address, contact

#### Invoice Templates

1. **Thermal Print**: For receipt printers
2. **A4 Print**: For standard printers
3. **PDF Export**: For digital sharing
4. **Custom Layout**: Modify invoice design

## Payment Processing

### Payment Methods

#### 1. Cash Payments

1. Select "Cash" as payment method
2. Enter amount received
3. System calculates change
4. Mark as completed

#### 2. Digital Payments

1. **UPI**: Enter UPI reference
2. **Card**: Enter card details and reference
3. **Netbanking**: Enter transaction reference
4. **Wallet**: Enter wallet transaction ID

### Payment Tracking

1. **View Payments**: Go to bill details
2. **Add Partial Payments**: For installment payments
3. **Payment History**: Track all transactions
4. **Outstanding Amounts**: View pending payments

## Reports and Analytics

### Sales Reports

#### Daily Sales

1. Go to **Reports** → **Daily Sales**
2. Select date range
3. View sales summary:
   - Total sales amount
   - Number of bills
   - Payment method breakdown
   - Top-selling products

#### Sales by Period

1. **Weekly Reports**: Sales by week
2. **Monthly Reports**: Sales by month
3. **Yearly Reports**: Annual sales summary
4. **Custom Period**: Select any date range

### Inventory Reports

#### Stock Reports

1. **Current Stock**: All products with quantities
2. **Low Stock**: Products below minimum level
3. **Stock Movement**: In/out transactions
4. **Category-wise**: Stock by product category

#### Product Performance

1. **Top Products**: Best-selling items
2. **Slow Movers**: Products with low sales
3. **Profit Analysis**: Profit margins by product
4. **Seasonal Trends**: Sales patterns

### Customer Reports

#### Customer Analytics

1. **Customer List**: All registered customers
2. **Top Customers**: Highest spending customers
3. **Customer Activity**: Purchase history
4. **New Customers**: Recently registered

## Admin Panel

### User Management

#### Create Users

1. Go to **Admin** → **Users**
2. Click **Add User**
3. Fill in user details:
   - Personal information
   - Login credentials
   - Role assignment
   - Permissions

#### User Roles

1. **Admin**: Full system access
2. **Manager**: Product, customer, bill management
3. **Staff**: Basic operations, limited access
4. **Cashier**: Billing and payment only

### System Settings

#### General Settings

1. **Store Information**: Name, address, contact
2. **Tax Settings**: GST/VAT rates
3. **Currency**: Default currency
4. **Date Format**: Display preferences

#### Barcode Settings

1. **Default Format**: CODE128, EAN13, QR Code
2. **Label Size**: Width and height
3. **Print Settings**: Printer configuration
4. **Auto-generation**: Enable/disable

## WhatsApp Integration

### Setup WhatsApp Business API

1. **Get API Token**: From WhatsApp Business API provider
2. **Configure Settings**: Add token to environment
3. **Test Connection**: Send test message

### Send Invoices

1. **Generate Invoice**: Create bill and invoice
2. **Click Send WhatsApp**: In invoice view
3. **Enter Phone Number**: Customer's WhatsApp number
4. **Custom Message**: Add personal message
5. **Send**: Invoice sent via WhatsApp

### Fallback Method

If WhatsApp API is not available:

1. **Generate Share Link**: Create shareable link
2. **Copy Link**: Copy to clipboard
3. **Manual Send**: Send via personal WhatsApp

## Data Import/Export

### Import Data

#### CSV Import

1. **Prepare CSV**: Format data according to template
2. **Go to Import**: Select data type (products, customers)
3. **Upload File**: Select CSV file
4. **Map Fields**: Match CSV columns to system fields
5. **Import**: Process and import data

#### Supported Formats

- **Products**: Name, SKU, category, prices, stock
- **Customers**: Name, contact, address details
- **Categories**: Category names and descriptions

### Export Data

#### Export Options

1. **Products**: All product data with inventory
2. **Customers**: Customer list with contact details
3. **Bills**: Sales data with item details
4. **Reports**: Formatted reports in Excel/PDF

#### Export Formats

- **CSV**: For data analysis
- **Excel**: For detailed reports
- **PDF**: For printing and sharing

## Best Practices

### Daily Operations

1. **Morning Setup**: Check system status, review alerts
2. **Stock Check**: Verify inventory levels
3. **Customer Service**: Handle customer queries
4. **End of Day**: Review sales, backup data

### Data Management

1. **Regular Backups**: Daily database backups
2. **Data Validation**: Check for data inconsistencies
3. **Cleanup**: Remove old temporary files
4. **Updates**: Keep system updated

### Security

1. **User Access**: Limit access based on roles
2. **Password Policy**: Strong passwords, regular changes
3. **Session Management**: Logout inactive sessions
4. **Audit Trail**: Monitor system activities

## Troubleshooting

### Common Issues

#### Billing Issues

1. **Product Not Found**: Check product status and stock
2. **Price Calculation**: Verify product prices and discounts
3. **Payment Errors**: Check payment method configuration

#### Inventory Issues

1. **Stock Mismatch**: Reconcile physical and system stock
2. **Negative Stock**: Check for data entry errors
3. **Low Stock Alerts**: Update minimum stock levels

#### System Issues

1. **Slow Performance**: Check database indexes
2. **Connection Errors**: Verify network and database
3. **Print Issues**: Check printer configuration

### Getting Help

1. **Documentation**: Check this guide and API docs
2. **Logs**: Review system logs for errors
3. **Support**: Contact system administrator
4. **Community**: Join user community forums

## Tips and Tricks

### Productivity Tips

1. **Keyboard Shortcuts**: Use shortcuts for common actions
2. **Barcode Scanning**: Use scanner for faster product entry
3. **Templates**: Create measurement templates for regular customers
4. **Quick Actions**: Use dashboard quick actions

### Advanced Features

1. **Bulk Operations**: Import/export multiple records
2. **Custom Reports**: Create custom report templates
3. **API Integration**: Connect with external systems
4. **Automation**: Set up automated processes

This guide covers the essential features of the system. For advanced features and customization, refer to the API documentation and developer guides.
