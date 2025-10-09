# WhatsApp Integration Guide

This guide explains how to integrate WhatsApp Business API with the Clothing Store Billing & Inventory System for sending invoices and notifications.

## Table of Contents

1. [WhatsApp Business API Setup](#whatsapp-business-api-setup)
2. [Configuration](#configuration)
3. [Sending Invoices](#sending-invoices)
4. [Fallback Methods](#fallback-methods)
5. [Message Templates](#message-templates)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

## WhatsApp Business API Setup

### Prerequisites

1. **Facebook Business Account**: Create a Facebook Business account
2. **WhatsApp Business Account**: Set up WhatsApp Business account
3. **Phone Number**: Dedicated phone number for business
4. **Meta Developer Account**: Register as Meta developer

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details:
   - App Name: "Clothing Store System"
   - App Contact Email: your-email@domain.com
   - Business Account: Select your business account

### Step 2: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set up"
3. Follow the setup wizard

### Step 3: Configure Phone Number

1. Go to WhatsApp → Getting Started
2. Add your business phone number
3. Verify the phone number via SMS/call
4. Note down the Phone Number ID

### Step 4: Get Access Token

1. Go to WhatsApp → API Setup
2. Copy the temporary access token
3. For production, create a permanent access token:
   - Go to System Users
   - Create a system user
   - Generate access token with WhatsApp permissions

### Step 5: Set Up Webhook (Optional)

1. Go to WhatsApp → Configuration
2. Set webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
3. Set verify token (use a secure random string)
4. Subscribe to message events

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Optional: For message templates
WHATSAPP_TEMPLATE_NAMESPACE=your_template_namespace
```

### Backend Configuration

Update your backend configuration:

```typescript
// src/config/whatsapp.ts
export const whatsappConfig = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
  accessToken: process.env.WHATSAPP_API_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
};
```

## Sending Invoices

### Implementation

Create a WhatsApp service:

```typescript
// src/services/WhatsAppService.ts
import axios from 'axios';
import { whatsappConfig } from '@/config/whatsapp';
import { Logger } from '@/utils/Logger';

export class WhatsAppService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public async sendInvoice(
    phoneNumber: string,
    billData: any,
    customMessage?: string
  ): Promise<boolean> {
    try {
      // Format phone number (remove +, spaces, etc.)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Generate invoice PDF
      const invoicePdf = await this.generateInvoicePdf(billData);
      
      // Upload PDF to WhatsApp
      const mediaId = await this.uploadMedia(invoicePdf, 'application/pdf');
      
      // Send message with invoice
      const message = customMessage || this.getDefaultInvoiceMessage(billData);
      
      await this.sendMessage(formattedNumber, message, mediaId);
      
      this.logger.info('Invoice sent via WhatsApp', {
        phoneNumber: formattedNumber,
        billId: billData.id,
        billNumber: billData.billNumber,
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp invoice:', error);
      throw error;
    }
  }

  private async sendMessage(
    phoneNumber: string,
    message: string,
    mediaId?: string
  ): Promise<void> {
    const url = `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`;
    
    const payload: any = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: { body: message }
    };

    if (mediaId) {
      payload.type = 'document';
      payload.document = {
        id: mediaId,
        filename: 'invoice.pdf',
        caption: message
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.error) {
      throw new Error(`WhatsApp API Error: ${response.data.error.message}`);
    }
  }

  private async uploadMedia(fileBuffer: Buffer, mimeType: string): Promise<string> {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fileBuffer, {
      filename: 'invoice.pdf',
      contentType: mimeType
    });
    form.append('type', mimeType);
    form.append('messaging_product', 'whatsapp');

    const response = await axios.post(
      `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/media`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${whatsappConfig.accessToken}`,
          ...form.getHeaders()
        }
      }
    );

    return response.data.id;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }

  private getDefaultInvoiceMessage(billData: any): string {
    return `🏪 *Clothing Store Invoice*

📄 *Bill Number:* ${billData.billNumber}
💰 *Total Amount:* ₹${billData.finalAmount}
📅 *Date:* ${new Date(billData.createdAt).toLocaleDateString('en-IN')}

Thank you for your business! 🙏

For any queries, contact us at:
📞 +91-9876543210
📧 info@clothingstore.com`;
  }

  private async generateInvoicePdf(billData: any): Promise<Buffer> {
    // Implementation for generating PDF invoice
    // This would use your existing PDF generation logic
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Add invoice content
    doc.text(`Invoice #${billData.billNumber}`, 50, 50);
    doc.text(`Total: ₹${billData.finalAmount}`, 50, 100);
    
    // Return PDF buffer
    return new Promise((resolve) => {
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.end();
    });
  }
}
```

### API Endpoint

Add the WhatsApp endpoint to your bill routes:

```typescript
// src/routes/BillRoutes.ts
import { WhatsAppService } from '@/services/WhatsAppService';

export class BillRoutes {
  private whatsappService: WhatsAppService;

  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  // ... existing routes ...

  private initializeRoutes(): void {
    // ... existing routes ...

    // Send invoice via WhatsApp
    this.router.post(
      '/:id/send-whatsapp',
      [
        param('id').isString().withMessage('Bill ID is required'),
        body('phoneNumber').isString().withMessage('Phone number is required'),
        body('message').optional().isString().withMessage('Message must be a string'),
      ],
      ValidationMiddleware.validate,
      ValidationMiddleware.sanitizeInput,
      AuthMiddleware.authenticate,
      this.sendInvoiceWhatsApp.bind(this)
    );
  }

  private async sendInvoiceWhatsApp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { phoneNumber, message } = req.body;

      // Get bill data
      const bill = await this.billModel.findById(id);
      if (!bill) {
        throw ErrorHandler.createError('Bill not found', 404);
      }

      // Send via WhatsApp
      await this.whatsappService.sendInvoice(phoneNumber, bill, message);

      res.status(200).json({
        success: true,
        message: 'Invoice sent via WhatsApp successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
```

## Fallback Methods

### Method 1: WhatsApp Share Link

If WhatsApp API is not available, generate a shareable link:

```typescript
// src/services/WhatsAppFallbackService.ts
export class WhatsAppFallbackService {
  public generateShareLink(billData: any, message?: string): string {
    const defaultMessage = message || this.getDefaultMessage(billData);
    const encodedMessage = encodeURIComponent(defaultMessage);
    
    return `https://wa.me/?text=${encodedMessage}`;
  }

  public generateInvoiceShareLink(billData: any): string {
    const invoiceUrl = `${process.env.FRONTEND_URL}/bills/${billData.id}/invoice`;
    const message = `Your invoice is ready! View it here: ${invoiceUrl}`;
    
    return this.generateShareLink(billData, message);
  }

  private getDefaultMessage(billData: any): string {
    return `🏪 Clothing Store Invoice

📄 Bill Number: ${billData.billNumber}
💰 Total Amount: ₹${billData.finalAmount}
📅 Date: ${new Date(billData.createdAt).toLocaleDateString('en-IN')}

Thank you for your business! 🙏`;
  }
}
```

### Method 2: SMS Integration

As an alternative, integrate SMS service:

```typescript
// src/services/SMSService.ts
export class SMSService {
  public async sendInvoiceSMS(phoneNumber: string, billData: any): Promise<boolean> {
    const message = `Your invoice #${billData.billNumber} for ₹${billData.finalAmount} is ready. View: ${process.env.FRONTEND_URL}/bills/${billData.id}/invoice`;
    
    // Implement SMS service (Twilio, AWS SNS, etc.)
    // This is a placeholder implementation
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return true;
  }
}
```

## Message Templates

### Create Message Templates

For business-initiated conversations, create approved message templates:

1. Go to WhatsApp Manager
2. Navigate to Message Templates
3. Create new template

#### Invoice Template

```
Template Name: invoice_notification
Category: UTILITY
Language: en_US

Body:
🏪 *{{1}}* Invoice

📄 Bill Number: {{2}}
💰 Total Amount: ₹{{3}}
📅 Date: {{4}}

Thank you for your business! 🙏

For queries: {{5}}
```

#### Payment Reminder Template

```
Template Name: payment_reminder
Category: UTILITY
Language: en_US

Body:
Hi {{1}},

This is a friendly reminder that your invoice #{{2}} for ₹{{3}} is due on {{4}}.

Please make the payment at your earliest convenience.

Thank you!
{{5}}
```

### Using Templates

```typescript
public async sendTemplateMessage(
  phoneNumber: string,
  templateName: string,
  parameters: string[]
): Promise<void> {
  const url = `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: parameters.map(param => ({ type: 'text', text: param }))
        }
      ]
    }
  };

  await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}
```

## Error Handling

### Common WhatsApp API Errors

```typescript
// src/utils/WhatsAppErrorHandler.ts
export class WhatsAppErrorHandler {
  public static handleError(error: any): string {
    if (error.response?.data?.error) {
      const whatsappError = error.response.data.error;
      
      switch (whatsappError.code) {
        case 100:
          return 'Invalid phone number format';
        case 131026:
          return 'Message failed to send - recipient may have blocked the number';
        case 131021:
          return 'Recipient cannot be messaged';
        case 190:
          return 'Access token expired or invalid';
        case 368:
          return 'Temporarily blocked for spam';
        default:
          return `WhatsApp API Error: ${whatsappError.message}`;
      }
    }
    
    return 'Failed to send WhatsApp message';
  }
}
```

### Retry Logic

```typescript
public async sendInvoiceWithRetry(
  phoneNumber: string,
  billData: any,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.sendInvoice(phoneNumber, billData);
      return true;
    } catch (error) {
      this.logger.warn(`WhatsApp send attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return false;
}
```

## Testing

### Test WhatsApp Integration

```typescript
// tests/whatsapp.test.ts
import { WhatsAppService } from '@/services/WhatsAppService';

describe('WhatsApp Service', () => {
  let whatsappService: WhatsAppService;

  beforeEach(() => {
    whatsappService = new WhatsAppService();
  });

  test('should format phone number correctly', () => {
    const formatted = whatsappService.formatPhoneNumber('+91 98765 43210');
    expect(formatted).toBe('919876543210');
  });

  test('should send invoice successfully', async () => {
    const mockBillData = {
      id: 'bill_001',
      billNumber: 'CS241201001',
      finalAmount: 2000,
      createdAt: new Date().toISOString()
    };

    // Mock the WhatsApp API call
    jest.spyOn(whatsappService, 'sendMessage').mockResolvedValue(undefined);
    
    const result = await whatsappService.sendInvoice('9876543210', mockBillData);
    expect(result).toBe(true);
  });
});
```

### Manual Testing

1. **Test with Your Number**: Send test messages to your own WhatsApp number
2. **Verify Message Format**: Check that messages are properly formatted
3. **Test PDF Attachment**: Ensure invoice PDFs are attached correctly
4. **Test Error Handling**: Try sending to invalid numbers

### Production Testing

1. **Start with Small Volume**: Test with a few customers first
2. **Monitor Delivery Rates**: Check WhatsApp Business API metrics
3. **Handle Opt-outs**: Respect customer preferences
4. **Comply with Policies**: Follow WhatsApp Business Policy

## Best Practices

### Message Guidelines

1. **Keep Messages Concise**: WhatsApp messages should be brief and clear
2. **Use Emojis Sparingly**: Don't overuse emojis in business messages
3. **Include Contact Info**: Always provide contact details for support
4. **Respect Timing**: Send messages during business hours
5. **Personalize**: Use customer names when possible

### Privacy and Compliance

1. **Get Consent**: Ensure customers have opted in to receive messages
2. **Provide Opt-out**: Include unsubscribe instructions
3. **Data Protection**: Follow GDPR and local privacy laws
4. **Secure Storage**: Encrypt customer phone numbers
5. **Audit Trail**: Log all message sending activities

### Performance Optimization

1. **Batch Processing**: Send messages in batches during off-peak hours
2. **Rate Limiting**: Respect WhatsApp API rate limits
3. **Caching**: Cache frequently used templates
4. **Monitoring**: Set up alerts for failed messages
5. **Fallback**: Always have alternative communication methods

## Troubleshooting

### Common Issues

#### 1. Messages Not Delivered

- Check phone number format
- Verify recipient hasn't blocked your number
- Ensure access token is valid
- Check rate limits

#### 2. Template Rejected

- Follow WhatsApp template guidelines
- Avoid promotional content in utility templates
- Use approved template categories
- Wait for template approval

#### 3. Media Upload Fails

- Check file size limits (16MB for documents)
- Verify supported file formats
- Ensure proper MIME type
- Check network connectivity

### Debug Mode

Enable debug logging:

```typescript
// src/config/whatsapp.ts
export const whatsappConfig = {
  // ... existing config
  debug: process.env.NODE_ENV === 'development',
  logLevel: process.env.WHATSAPP_LOG_LEVEL || 'info',
};
```

### Support Resources

1. **WhatsApp Business API Documentation**: [developers.facebook.com](https://developers.facebook.com/docs/whatsapp)
2. **Meta Business Help Center**: [business.facebook.com/help](https://business.facebook.com/help)
3. **Community Forums**: Stack Overflow, Reddit
4. **Official Support**: Through Meta Developer Support

This WhatsApp integration guide provides comprehensive instructions for implementing WhatsApp Business API with your clothing store system. Follow the setup steps carefully and test thoroughly before deploying to production.
