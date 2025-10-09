# Email Setup Fix for Invitation System

## Issue
The invitation email failed to send with the error:
```
Failed to send invitation email: {
  "code": "EAUTH",
  "response": "535-5.7.8 Username and Password not accepted"
}
```

## Solution

### Option 1: Use Gmail App Password (Recommended for Gmail)

If you're using Gmail, you need to use an **App Password** instead of your regular password:

1. **Enable 2-Factor Authentication** on your Google Account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Tailor Bill Craft" as the name
   - Click "Generate"
   - Copy the 16-character password

3. **Update Backend Environment Variables**:
   Edit `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password-here
   EMAIL_FROM=your-email@gmail.com
   ```

### Option 2: Use Other Email Services

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

#### SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=your-verified-sender@yourdomain.com
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Development Testing (No Real Emails)

For testing without sending real emails, use Ethereal (temporary test email):

1. Visit https://ethereal.email/create
2. Copy the SMTP credentials provided
3. Update your `.env`:
   ```env
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=generated-username@ethereal.email
   SMTP_PASSWORD=generated-password
   EMAIL_FROM=noreply@yourdomain.com
   ```

All sent emails will be captured at https://ethereal.email/messages

## After Configuration

1. **Restart the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the invitation system**:
   - Go to Team Management
   - Send a new invitation OR
   - Click the **Resend** button (🔄) on existing invitations

## New Features Added

✅ **Resend Button**: Click the blue refresh icon (🔄) to resend invitation emails
✅ **Delete Button**: Click the red trash icon (🗑️) to cancel/delete pending invitations

## Troubleshooting

If emails still don't send:

1. **Check the backend logs** for detailed error messages
2. **Verify SMTP credentials** are correct
3. **Check firewall/network** settings (port 587 or 465 must be open)
4. **Try a different email service** (SendGrid, Mailgun recommended for production)

## Production Recommendations

For production use, we recommend:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Very cheap, $0.10 per 1,000 emails)

These services provide better deliverability and don't require app passwords.

