# Barcode Generation and Management Guide

This guide explains how to use the barcode generation and management features in the Clothing Store Billing & Inventory System.

## Table of Contents

1. [Supported Barcode Formats](#supported-barcode-formats)
2. [Barcode Generation](#barcode-generation)
3. [Barcode Labels](#barcode-labels)
4. [Barcode Scanning](#barcode-scanning)
5. [Integration Examples](#integration-examples)
6. [Best Practices](#best-practices)

## Supported Barcode Formats

The system supports multiple barcode formats for different use cases:

### Linear Barcodes

#### CODE128
- **Use Case**: Most versatile, supports alphanumeric characters
- **Best For**: Internal product codes, SKUs
- **Character Set**: Full ASCII (0-127)
- **Length**: Variable (up to 80 characters)

#### CODE39
- **Use Case**: Simple alphanumeric barcodes
- **Best For**: Basic product identification
- **Character Set**: 0-9, A-Z, space, and special characters
- **Length**: Variable (up to 43 characters)

#### EAN13
- **Use Case**: International retail products
- **Best For**: Products sold in retail stores
- **Character Set**: Numeric only
- **Length**: 13 digits (12 data + 1 check digit)

#### EAN8
- **Use Case**: Small retail products
- **Best For**: Small items with limited space
- **Character Set**: Numeric only
- **Length**: 8 digits (7 data + 1 check digit)

#### UPC
- **Use Case**: North American retail products
- **Best For**: Products sold in US/Canada
- **Character Set**: Numeric only
- **Length**: 12 digits (11 data + 1 check digit)

### 2D Barcodes

#### QR Code
- **Use Case**: Detailed product information, URLs
- **Best For**: Marketing, detailed product data
- **Character Set**: Full Unicode
- **Capacity**: Up to 4,296 characters

## Barcode Generation

### Automatic Generation

The system automatically generates barcodes for new products:

```typescript
// When creating a product, barcode is auto-generated
const product = await productModel.createProduct({
  name: "Cotton Shirt",
  sku: "SHIRT-001",
  // ... other fields
  // barcode will be auto-generated as "SHIRT-001" in CODE128 format
});
```

### Manual Generation

Generate barcodes manually through the API:

```typescript
// Generate barcode for existing product
const barcodeResult = await barcodeService.generateBarcode(
  "SHIRT-001",           // Text to encode
  "CODE128",             // Format
  {
    width: 2,            // Bar width
    height: 100,         // Bar height
    scale: 3,            // Scale factor
    includetext: true    // Include text below barcode
  }
);
```

### API Endpoints

#### Generate Barcode Image

```http
POST /api/barcodes/generate
Content-Type: application/json

{
  "text": "SHIRT-001",
  "format": "CODE128",
  "width": 2,
  "height": 100,
  "scale": 3,
  "includetext": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": "base64-encoded-image-data",
    "format": "CODE128",
    "text": "SHIRT-001"
  }
}
```

#### Generate Barcode as SVG

```http
POST /api/barcodes/generate/svg
Content-Type: application/json

{
  "text": "SHIRT-001",
  "format": "CODE128",
  "width": 2,
  "height": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "svg": "<svg>...</svg>",
    "format": "CODE128",
    "text": "SHIRT-001"
  }
}
```

#### Generate Barcode as Data URL

```http
POST /api/barcodes/generate/dataurl
Content-Type: application/json

{
  "text": "SHIRT-001",
  "format": "CODE128"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "format": "CODE128",
    "text": "SHIRT-001"
  }
}
```

## Barcode Labels

### Label Generation

Generate printable barcode labels with product information:

```typescript
const labelBuffer = await barcodeService.generateBarcodeLabel(
  "SHIRT-001",                    // Barcode text
  "CODE128",                      // Format
  {
    productName: "Cotton Shirt",  // Product name
    price: 800,                   // Price
    sku: "SHIRT-001",            // SKU
    width: 200,                   // Label width
    height: 100                   // Label height
  }
);
```

### Label Templates

#### Standard Product Label

```
┌─────────────────────────┐
│    Clothing Store       │
├─────────────────────────┤
│  Cotton Shirt           │
│  SKU: SHIRT-001         │
│  Price: ₹800            │
│                         │
│  ████████████████████   │
│  ████████████████████   │
│  ████████████████████   │
│                         │
│  SHIRT-001              │
└─────────────────────────┘
```

#### Fabric Label

```
┌─────────────────────────┐
│    Clothing Store       │
├─────────────────────────┤
│  Cotton Fabric          │
│  SKU: FABRIC-001        │
│  Price: ₹300/meter      │
│                         │
│  ████████████████████   │
│  ████████████████████   │
│  ████████████████████   │
│                         │
│  FABRIC-001             │
└─────────────────────────┘
```

### Print Configuration

#### Thermal Printer Settings

```typescript
const thermalConfig = {
  width: 58,        // 58mm thermal printer
  height: 40,       // 40mm label height
  dpi: 203,         // 203 DPI
  format: "CODE128",
  fontSize: 10,
  includePrice: true,
  includeStoreName: true
};
```

#### A4 Printer Settings

```typescript
const a4Config = {
  width: 200,       // 200px width
  height: 100,      // 100px height
  dpi: 300,         // 300 DPI for high quality
  format: "CODE128",
  fontSize: 12,
  includePrice: true,
  includeStoreName: true,
  labelsPerRow: 3,  // 3 labels per row
  rowsPerPage: 8    // 8 rows per page
};
```

## Barcode Scanning

### Hardware Integration

#### USB Barcode Scanner

Most USB barcode scanners work as keyboard wedge devices:

```typescript
// Listen for barcode input
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && barcodeBuffer.length > 0) {
    const barcode = barcodeBuffer.join('');
    handleBarcodeScan(barcode);
    barcodeBuffer = [];
  } else if (event.key.length === 1) {
    barcodeBuffer.push(event.key);
  }
});
```

#### Mobile Camera Scanning

For mobile devices, use camera-based scanning:

```typescript
// Using QuaggaJS for barcode scanning
import Quagga from 'quagga';

const startBarcodeScanner = () => {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner'),
      constraints: {
        width: 640,
        height: 480,
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
    }
  }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((data) => {
    const barcode = data.codeResult.code;
    handleBarcodeScan(barcode);
  });
};
```

### API Integration

#### Scan Barcode from Image

```http
POST /api/barcodes/scan
Content-Type: application/json
Authorization: Bearer <token>

{
  "image": "base64-encoded-image-data"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "barcode": "SHIRT-001",
    "format": "CODE128",
    "confidence": 0.95
  }
}
```

## Integration Examples

### Frontend Integration

#### React Component for Barcode Display

```tsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface BarcodeDisplayProps {
  productId: string;
  format?: string;
  showLabel?: boolean;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  productId,
  format = 'CODE128',
  showLabel = true
}) => {
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateBarcode();
  }, [productId, format]);

  const generateBarcode = async () => {
    setLoading(true);
    try {
      const response = await apiClient.barcodes.generateDataURL({
        text: productId,
        format,
        width: 2,
        height: 100,
        includetext: showLabel
      });
      setBarcodeDataUrl(response.data.dataUrl);
    } catch (error) {
      console.error('Failed to generate barcode:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Generating barcode...</div>;
  }

  return (
    <div className="barcode-container">
      <img src={barcodeDataUrl} alt="Barcode" />
      {showLabel && <div className="barcode-label">{productId}</div>}
    </div>
  );
};
```

#### Barcode Scanner Component

```tsx
import React, { useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      onError('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    
    try {
      const response = await apiClient.barcodes.scan(imageData);
      onScan(response.data.barcode);
    } catch (error) {
      onError('No barcode detected');
    }
  };

  return (
    <div className="barcode-scanner">
      <video ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={captureAndScan}>Scan Barcode</button>
    </div>
  );
};
```

### Backend Integration

#### Barcode Service Implementation

```typescript
// src/services/BarcodeService.ts
import bwipjs from 'bwip-js';
import QRCode from 'qrcode';
import { Logger } from '@/utils/Logger';

export class BarcodeService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public async generateBarcode(
    text: string,
    format: BarcodeFormat = 'CODE128',
    options: Partial<BarcodeOptions> = {}
  ): Promise<BarcodeResult> {
    try {
      const barcodeOptions: BarcodeOptions = {
        format,
        width: options.width || 2,
        height: options.height || 100,
        text: options.text || text,
        scale: options.scale || 3,
        includetext: options.includetext !== false,
      };

      if (format === 'QRCODE') {
        return await this.generateQRCode(text, barcodeOptions);
      } else {
        return await this.generateLinearBarcode(text, barcodeOptions);
      }
    } catch (error) {
      this.logger.error('Error generating barcode:', error);
      throw error;
    }
  }

  private async generateLinearBarcode(
    text: string,
    options: BarcodeOptions
  ): Promise<BarcodeResult> {
    const canvas = await bwipjs.toCanvas({
      bcid: options.format.toLowerCase(),
      text: text,
      scale: options.scale,
      height: options.height,
      width: options.width,
      includetext: options.includetext,
      textxalign: 'center',
      textyalign: 'below',
      textsize: 12,
      textfont: 'monospace',
    });

    const buffer = canvas.toBuffer('image/png');
    
    return {
      data: buffer,
      format: options.format,
      text: text,
    };
  }

  private async generateQRCode(
    text: string,
    options: BarcodeOptions
  ): Promise<BarcodeResult> {
    const qrOptions = {
      width: options.width! * 10,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M' as const,
    };

    const buffer = await QRCode.toBuffer(text, qrOptions);
    
    return {
      data: buffer,
      format: 'QRCODE',
      text: text,
    };
  }
}
```

## Best Practices

### Barcode Design

1. **Size and Scaling**
   - Minimum height: 0.5 inches (12.7mm)
   - Minimum width: 1.5 inches (38.1mm)
   - Use appropriate scaling for print quality

2. **Text Inclusion**
   - Always include human-readable text below barcode
   - Use clear, readable fonts
   - Ensure text doesn't interfere with barcode scanning

3. **Color and Contrast**
   - Use black bars on white background
   - Avoid colored backgrounds
   - Ensure high contrast for reliable scanning

### Product Identification

1. **SKU Generation**
   - Use consistent format: CATEGORY-TYPE-NUMBER
   - Example: SHIRT-COTTON-001, PANTS-DENIM-002
   - Keep SKUs short but descriptive

2. **Barcode Assignment**
   - Assign barcodes immediately when creating products
   - Use SKU as barcode for internal products
   - Use manufacturer barcodes for branded products

3. **Database Storage**
   - Store barcode as unique field
   - Index barcode field for fast lookups
   - Validate barcode format before storage

### Printing Guidelines

1. **Label Materials**
   - Use high-quality label stock
   - Choose appropriate adhesive for application
   - Consider environmental conditions (moisture, temperature)

2. **Printer Settings**
   - Use appropriate DPI for label size
   - Test print quality before bulk printing
   - Maintain printer for consistent output

3. **Label Placement**
   - Place labels on flat, clean surfaces
   - Avoid wrinkles and creases
   - Ensure labels are easily scannable

### Performance Optimization

1. **Caching**
   - Cache generated barcodes for frequently accessed products
   - Use CDN for barcode images
   - Implement proper cache invalidation

2. **Batch Operations**
   - Generate multiple barcodes in batches
   - Use background jobs for large-scale generation
   - Implement progress tracking for long operations

3. **Error Handling**
   - Validate barcode format before generation
   - Handle generation failures gracefully
   - Provide fallback options for failed generations

### Security Considerations

1. **Access Control**
   - Restrict barcode generation to authorized users
   - Log all barcode generation activities
   - Implement rate limiting for API endpoints

2. **Data Protection**
   - Don't expose sensitive data in barcodes
   - Use encrypted barcodes for sensitive information
   - Implement proper access controls for scanned data

3. **Audit Trail**
   - Log all barcode scanning activities
   - Track barcode generation and usage
   - Monitor for suspicious scanning patterns

This barcode guide provides comprehensive information for implementing and managing barcodes in your clothing store system. Follow the best practices to ensure reliable barcode generation and scanning functionality.
