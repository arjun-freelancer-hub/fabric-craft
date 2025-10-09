# Invitation System Guide

## Overview

The invitation system allows workspace owners and administrators to invite users to join their workspace. When an invitation is created, an email is automatically sent to the invited user with a secure link to accept the invitation and join the workspace.

## Features

- ✅ **Email Notifications**: Automated email invitations sent via SMTP (Gmail)
- ✅ **Secure Tokens**: Each invitation has a unique, secure token
- ✅ **Expiration**: Invitations expire after 7 days by default
- ✅ **Role Assignment**: Invite users as ADMIN or MEMBER
- ✅ **Beautiful Email Templates**: Professional HTML emails with responsive design
- ✅ **Welcome Emails**: New users receive a welcome email upon acceptance
- ✅ **Auto-Registration**: Users can create accounts directly from the invitation
- ✅ **Existing User Support**: If email is already registered, user is added directly

## Email Configuration

### SMTP Setup (Gmail)

The system is configured to use Gmail SMTP. Your credentials are already set in the `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=arjun2000raj@gmail.com
SMTP_PASS=tomhdnhfdqmjfzqd
APP_NAME=Tailor Bill Craft
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password

The password configured (`tomhdnhfdqmjfzqd`) is a Gmail **App Password**, which is required for third-party applications. If you need to generate a new one:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (must be enabled)
3. App passwords
4. Generate new app password for "Mail"
5. Use the 16-character password in your `.env` file

## How It Works

### 1. Creating an Invitation

**API Endpoint**: `POST /api/workspaces/:workspaceId/invite`

**Request Body**:
```json
{
  "email": "user@example.com",
  "role": "MEMBER"  // or "ADMIN"
}
```

**What Happens**:
1. System validates that the requester is an owner or admin
2. Checks if the workspace can invite more members (max 3 total)
3. Checks if the email already has a pending invitation
4. Checks if the email is already registered
5. Creates invitation with unique token and 7-day expiration
6. **Sends email** to the invited user with acceptance link
7. Returns invitation details

**Email Content**:
- Sender name and workspace name
- Role assignment
- Accept invitation button
- Expiration date
- Plain text fallback link

### 2. Receiving the Invitation Email

The invited user receives an email with:
- Subject: "You're invited to join [Workspace Name]"
- Professional gradient header
- Invitation details (workspace, role)
- Clear "Accept Invitation" button
- Expiration notice
- Link fallback if button doesn't work

### 3. Accepting the Invitation

**Frontend URL**: `http://localhost:3000/accept-invitation/[token]`

**API Endpoint**: `POST /api/auth/accept-invitation`

**Request Body**:
```json
{
  "token": "unique-invitation-token",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**What Happens**:
1. System verifies the token is valid and not expired
2. Checks if user with email already exists
3. If user doesn't exist:
   - Creates new user account
   - Creates their own personal workspace
4. Adds user to the invited workspace with specified role
5. Marks invitation as ACCEPTED
6. **Sends welcome email** to the new member
7. Generates JWT tokens and logs user in
8. Redirects to dashboard

### 4. Welcome Email

New members receive a welcome email containing:
- Personalized greeting
- Workspace name
- "Go to Dashboard" button
- Encouraging message

## API Endpoints

### Workspace Invitation Endpoints

#### Create Invitation
```
POST /api/workspaces/:id/invite
Authorization: Bearer <token>
```

#### Get Workspace Invitations
```
GET /api/workspaces/:id/invitations?status=PENDING
Authorization: Bearer <token>
```

#### Cancel Invitation
```
DELETE /api/workspaces/:id/invitations/:invitationId
Authorization: Bearer <token>
```

### Auth Invitation Endpoints

#### Verify Invitation Token
```
GET /api/auth/invite/verify/:token
```

#### Accept Invitation
```
POST /api/auth/accept-invitation
Body: { token, firstName?, lastName?, username?, password? }
```

## Testing the Invitation Flow

### Step 1: Create an Invitation

1. **Login as workspace owner/admin**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-email@example.com",
       "password": "your-password"
     }'
   ```

2. **Create invitation**:
   ```bash
   curl -X POST http://localhost:5000/api/workspaces/YOUR_WORKSPACE_ID/invite \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "email": "newuser@yopmail.com",
       "role": "MEMBER"
     }'
   ```

3. **Check the invited email inbox** for the invitation email

### Step 2: Accept Invitation

1. Open the invitation link from the email (or copy the token from API response in development)
2. Fill in the registration form:
   - First Name
   - Last Name
   - Username
   - Password (must meet requirements)
3. Click "Accept Invitation & Join"
4. You'll be redirected to the dashboard, logged in automatically

### Step 3: Verify Access

1. Check that the new user appears in the workspace members list
2. Verify the user has the correct role (ADMIN or MEMBER)
3. Check that the welcome email was sent

## Email Templates

### Invitation Email

The invitation email includes:
- 🎉 Celebratory header
- Sender information
- Workspace details
- Role assignment
- CTA button
- Expiration warning
- Fallback link

### Welcome Email

The welcome email includes:
- 🎉 Welcome header
- Personalized greeting
- Workspace confirmation
- Dashboard link
- Helpful message

## Invitation Status

Invitations can have the following statuses:

- `PENDING`: Invitation sent, awaiting acceptance
- `ACCEPTED`: User accepted and joined the workspace
- `EXPIRED`: Invitation expired (after 7 days)
- `CANCELLED`: Invitation cancelled by sender

## Security Features

1. **Unique Tokens**: Each invitation uses a cryptographically secure random token
2. **Expiration**: Invitations automatically expire after 7 days
3. **Single Use**: Tokens can only be used once
4. **Role Validation**: Only owners/admins can invite
5. **Member Limit**: Workspaces limited to 3 total members
6. **Email Validation**: Validates email format and uniqueness

## Frontend Components

### Accept Invitation Page
**Location**: `/frontend/src/app/accept-invitation/[token]/page.tsx`

Features:
- Token verification on page load
- User registration form
- Password strength validation
- Error handling
- Loading states
- Auto-redirect on success

### Workspace Settings
**Location**: Frontend workspace settings component

Features:
- Invite new members
- View pending/accepted invitations
- Cancel invitations
- Manage member roles

## Environment Variables

Required environment variables in `/backend/.env`:

```env
# Application
APP_NAME=Tailor Bill Craft
FRONTEND_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**:
   ```bash
   # Verify credentials are set
   cat backend/.env | grep SMTP
   ```

2. **Check Gmail App Password**:
   - Ensure 2FA is enabled on your Google account
   - Generate a new app password if needed
   - Update `.env` file

3. **Check server logs**:
   ```bash
   tail -f backend/logs/app.log | grep -i "email"
   ```

4. **Test email service**:
   The EmailService has a `verifyConnection()` method you can call to test SMTP connection.

### Invitation Link Not Working

1. **Check FRONTEND_URL** is correctly set in backend `.env`
2. **Verify token hasn't expired** (check `expiresAt` field)
3. **Check invitation status** (should be `PENDING`)

### User Already Exists Error

If the email is already registered:
- The user should login and will be automatically added to the workspace
- Or cancel the invitation and add them as an existing user

## Code Files

### Backend
- `/backend/src/services/EmailService.ts` - Email service with templates
- `/backend/src/models/InvitationModel.ts` - Invitation database model
- `/backend/src/routes/WorkspaceRoutes.ts` - Workspace invitation endpoints
- `/backend/src/controllers/AuthController.ts` - Invitation acceptance logic

### Frontend
- `/frontend/src/app/accept-invitation/[token]/page.tsx` - Accept invitation page
- `/frontend/src/lib/api.ts` - API client methods

## Best Practices

1. **Always check email** after creating invitations in development
2. **Use test email services** like Yopmail for testing
3. **Monitor invitation expiry** and resend if needed
4. **Validate user roles** before inviting
5. **Inform users** about invitation via multiple channels if possible

## Production Considerations

For production deployment:

1. **Use production SMTP service** (SendGrid, AWS SES, etc.)
2. **Set proper FRONTEND_URL** to your production domain
3. **Configure DNS records** for email authentication (SPF, DKIM)
4. **Monitor email delivery** rates
5. **Implement email queue** for high-volume invitations
6. **Add rate limiting** to prevent abuse
7. **Log all invitation activities** for audit trail

## Support

If you encounter issues:
1. Check server logs: `backend/logs/app.log`
2. Verify environment variables are set correctly
3. Test SMTP connection using Gmail's SMTP test tools
4. Check database for invitation records

## Future Enhancements

Potential improvements:
- [ ] Bulk invitations
- [ ] Custom invitation messages
- [ ] Invitation reminders
- [ ] Email templates customization
- [ ] SMS notifications
- [ ] Invitation analytics
- [ ] Custom expiration periods
- [ ] Multi-language support

