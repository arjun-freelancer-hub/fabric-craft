# WhatsApp Admin Settings Guide

## Overview

Your application now has a complete admin interface for configuring WhatsApp integration. Admin users can choose between two methods:

1. **WhatsApp Web Link** (Default) - Opens WhatsApp with pre-filled message
2. **WhatsApp Business API** - Fully automated messaging (requires Meta setup)

## Accessing Settings

### For Admin Users:

1. Log in to the dashboard
2. Click the **"Settings"** tab in the top navigation
3. Go to **"WhatsApp Integration"** section

## Configuration Options

### Method 1: WhatsApp Web Link (Recommended for Quick Start)

✅ **Advantages:**
- No setup required
- Works immediately
- Free to use
- No API credentials needed

**How it works:**
- When user clicks "Send on WhatsApp", WhatsApp opens with:
  - Customer's phone number pre-filled
  - Invoice message pre-written
- User just clicks "Send" in WhatsApp

**Setup Steps:**
1. In Settings, select "WhatsApp Web Link" method
2. Toggle "Enable WhatsApp integration" ON
3. Click "Save Settings"
4. Done! ✅

---

### Method 2: WhatsApp Business API (For Full Automation)

✅ **Advantages:**
- Fully automated
- No user interaction needed
- Professional messaging
- Scalable for high volume

⚠️ **Requirements:**
- Facebook Business Account
- WhatsApp Business Account
- Meta Developer Account
- API approval from Meta

**Setup Steps:**

#### Step 1: Get API Credentials

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a Business App
3. Add WhatsApp product
4. Get the following:
   - **API URL**: `https://graph.facebook.com/v18.0`
   - **Access Token**: From WhatsApp → API Setup
   - **Phone Number ID**: From WhatsApp → Getting Started
   - **Business Account ID**: (Optional)

#### Step 2: Configure in Application

1. Go to Settings → WhatsApp Integration
2. Select "WhatsApp Business API" method
3. Enter your credentials:
   ```
   API URL: https://graph.facebook.com/v18.0
   Access Token: Your_Permanent_Access_Token
   Phone Number ID: Your_Phone_Number_ID
   Business Account ID: Your_Business_Account_ID (optional)
   ```
4. Click "Test Connection" to verify
5. Click "Save Settings"

#### Step 3: Verify Setup

1. Generate an invoice
2. Click "Send on WhatsApp"
3. Check that message is delivered automatically

---

## Settings Interface

### Status Card
- Shows current integration status (Enabled/Disabled)
- Displays active method (Web Link or Business API)
- Toggle to enable/disable WhatsApp integration

### Method Selection
- Radio buttons to switch between methods
- Visual cards showing advantages of each method
- Recommended badge on Web Link method

### Business API Configuration
- Only visible when "Business API" is selected
- Input fields for all required credentials
- Password-masked Access Token field
- "Test Connection" button to verify setup

### Save Settings Button
- Located at bottom right
- Saves all changes to database
- Shows loading state while saving
- Success notification on save

---

## How It Works

### Database Storage
- All settings stored in `settings` table
- Category: `whatsapp`
- Settings are persisted across sessions
- Secure storage for API credentials

### Backend Flow
```
User clicks "Send on WhatsApp"
    ↓
Frontend calls API: POST /api/bills/{id}/send-whatsapp
    ↓
Backend reads settings from database
    ↓
If method = 'web':
    → Generates WhatsApp link
    → Returns link to frontend
    → Frontend opens link in new tab
    ↓
If method = 'api':
    → Calls WhatsApp Business API
    → Sends message automatically
    → Returns success response
```

### Default Configuration
- **Enabled**: Yes (by default)
- **Method**: Web Link
- **No credentials required** for initial use

---

## Switching Between Methods

### From Web Link to Business API:
1. Go to Settings
2. Select "WhatsApp Business API"
3. Enter all required credentials
4. Test connection
5. Save settings
6. Future messages will use API

### From Business API to Web Link:
1. Go to Settings
2. Select "WhatsApp Web Link"
3. Save settings
4. Credentials are preserved in database
5. Future messages will use web links

---

## Security Considerations

### Access Token Security
- Access tokens are stored as password type in UI
- Only admins can view/edit settings
- API endpoint requires authentication
- Settings changes are logged in audit trail

### Role-Based Access
- Only users with `ADMIN` role can:
  - Access Settings tab
  - View WhatsApp settings
  - Modify configuration
  - Test connections

---

## Troubleshooting

### Web Link Method

**Issue**: WhatsApp doesn't open
- **Solution**: Check if popup blocker is active
- **Solution**: Verify phone number format (should include country code)

**Issue**: Phone number not found
- **Solution**: Ensure customer has phone number in database
- **Solution**: Phone number should be 10 digits (without country code) or 12 digits (with country code)

### Business API Method

**Issue**: "Connection test failed"
- **Solution**: Verify Access Token is valid
- **Solution**: Check Phone Number ID is correct
- **Solution**: Ensure API URL is correct

**Issue**: Messages not delivered
- **Solution**: Check WhatsApp Business API status in Meta console
- **Solution**: Verify phone number is registered with WhatsApp
- **Solution**: Check if recipient has blocked your business number
- **Solution**: Verify you have message template approval (for business-initiated messages)

**Issue**: "Invalid phone number format"
- **Solution**: Phone numbers should be 10 digits (local) or 12 digits (with country code)
- **Solution**: Remove any special characters (+, -, spaces)

---

## Message Format

### Default Invoice Message:
```
🏪 Clothing Store Invoice

📄 Bill Number: CS251004001
💰 Total Amount: ₹1121
📅 Date: 04 Oct 2025
⏳ Status: Pending

Thank you for your business! 🙏

For any queries, please contact us.
```

### Customization:
The message is generated in `WhatsAppService.ts` → `getDefaultInvoiceMessage()`
You can customize the format by editing this function.

---

## API Endpoints

### Get WhatsApp Settings
```http
GET /api/settings/whatsapp
Authorization: Bearer {token}
```

### Update WhatsApp Settings
```http
PUT /api/settings/whatsapp
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": true,
  "method": "web",
  "apiUrl": "https://graph.facebook.com/v18.0",
  "accessToken": "your_token",
  "phoneNumberId": "your_phone_id",
  "businessAccountId": "your_business_id"
}
```

### Test Connection
```http
POST /api/settings/whatsapp/test
Authorization: Bearer {token}
```

---

## Best Practices

### 1. Start with Web Link
- Test the feature with web link method first
- Verify message format and flow
- Collect user feedback
- Then upgrade to API if needed

### 2. Backup Credentials
- Keep a secure backup of your API credentials
- Document where you got them from Meta console
- Store access tokens in secure location

### 3. Monitor Usage
- Check WhatsApp Business API usage in Meta console
- Monitor delivery rates
- Track failed messages

### 4. Customer Consent
- Ensure customers have opted in for WhatsApp messages
- Respect customer preferences
- Provide opt-out mechanism

### 5. Regular Testing
- Test connection periodically
- Verify access token hasn't expired
- Check for API updates from Meta

---

## Future Enhancements

### Planned Features:
- Message templates management UI
- Delivery status tracking
- Failed message retry mechanism
- Bulk WhatsApp sending
- Message history log
- Custom message templates per invoice type

### Upgrade Path:
When ready for full Business API:
1. Set up Meta Developer account
2. Create WhatsApp Business App
3. Get API credentials
4. Configure in Settings
5. Test thoroughly
6. Switch method from web to api
7. Deploy to production

---

## Support & Documentation

### Related Documents:
- `WHATSAPP_INTEGRATION.md` - Detailed technical implementation
- `API_DOCUMENTATION.md` - Complete API reference
- `USAGE_GUIDE.md` - General user guide

### External Resources:
- [Meta for Developers](https://developers.facebook.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)

### Getting Help:
1. Check this guide first
2. Review error messages in browser console
3. Check backend logs for detailed error info
4. Verify API credentials in Meta console
5. Test with different phone numbers

---

## Summary

✅ **You now have:**
- Admin settings interface ✓
- Two WhatsApp integration methods ✓
- Database-backed configuration ✓
- Easy switching between methods ✓
- Secure credential storage ✓
- Role-based access control ✓

✅ **Default setup:**
- WhatsApp enabled by default
- Uses Web Link method (no setup needed)
- Works immediately out of the box
- Can upgrade to Business API anytime

🎉 **Ready to use!** Admin users can access Settings tab and configure WhatsApp as needed.

