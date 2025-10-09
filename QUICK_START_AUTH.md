# Quick Start Guide - New Authentication System

## 🚀 Quick Setup (3 Steps)

### Step 1: Register Owner (First Time Only)
```bash
POST http://localhost:3000/api/auth/register/owner

Body:
{
  "email": "owner@yourcompany.com",
  "username": "owner",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Step 2: Owner Invites Team Members
```bash
POST http://localhost:3000/api/users/invite
Authorization: Bearer <owner-token>

Body:
{
  "email": "admin@yourcompany.com",
  "role": "ADMIN"
}

# Copy the invitation link from the response
```

### Step 3: Team Members Register via Invitation
```bash
POST http://localhost:3000/api/auth/register/invite

Body:
{
  "token": "<invitation-token-from-email>",
  "username": "admin",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

---

## 👥 Role Permissions At a Glance

| Action | OWNER | ADMIN | STAFF |
|--------|-------|-------|-------|
| Register (first time) | ✅ | ❌ | ❌ |
| Invite ADMIN | ✅ | ❌ | ❌ |
| Invite STAFF | ✅ | ✅ | ❌ |
| Change ADMIN password | ✅ | ❌ | ❌ |
| Change STAFF password | ✅ | ✅ | ❌ |
| Change OWNER password | ❌ | ❌ | ❌ |
| View all users | ✅ | ✅ | ❌ |
| Manage invoices | ✅ | ✅ | ✅ |
| Manage products | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ |

---

## 🔑 Common Operations

### Login
```bash
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "Password123!"
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
{
  "email": "user@company.com"
}
# Check email for reset link (or check response in dev mode)
```

### Reset Password
```bash
POST /api/auth/reset-password
{
  "token": "<reset-token-from-email>",
  "newPassword": "NewPassword123!"
}
```

### Change Own Password
```bash
POST /api/auth/change-password
Authorization: Bearer <token>
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Admin Changes User Password
```bash
POST /api/users/:userId/change-password
Authorization: Bearer <admin-or-owner-token>
{
  "newPassword": "NewPassword123!"
}
```

### List Invitations
```bash
GET /api/users/invitations
Authorization: Bearer <admin-or-owner-token>
```

### Cancel Invitation
```bash
DELETE /api/users/invitations/:invitationId
Authorization: Bearer <admin-or-owner-token>
```

---

## ⚠️ Important Notes

1. **Only ONE owner can exist** - First registration creates owner, subsequent attempts will fail
2. **Invitations expire in 7 days** - Users must register within this time
3. **Password reset tokens expire in 1 hour** - Quick action required
4. **Passwords must be strong:**
   - Minimum 8 characters
   - 1 uppercase letter
   - 1 lowercase letter  
   - 1 number
   - 1 special character (@$!%*?&)

5. **Role hierarchy is strict:**
   - You can only manage users BELOW you
   - You can only invite roles BELOW you
   - OWNER > ADMIN > STAFF

---

## 🔧 Environment Setup

Make sure `.env` file has:
```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
DATABASE_URL=mysql://user:pass@localhost:3306/db
```

---

## 📱 Testing with Postman/Thunder Client

### Collection Structure
```
Authentication
├── Register Owner (POST /api/auth/register/owner)
├── Login (POST /api/auth/login)
├── Forgot Password (POST /api/auth/forgot-password)
├── Reset Password (POST /api/auth/reset-password)
└── Change Password (POST /api/auth/change-password)

User Management (Requires Auth Token)
├── Invite User (POST /api/users/invite)
├── List Invitations (GET /api/users/invitations)
├── Cancel Invitation (DELETE /api/users/invitations/:id)
├── Change User Password (POST /api/users/:id/change-password)
└── Update User Role (PATCH /api/users/:id/role)

Invitation Flow
├── Verify Invitation (GET /api/auth/invite/verify/:token)
└── Register with Invitation (POST /api/auth/register/invite)
```

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Owner already exists" | Trying to register second owner | Login with existing owner or contact admin |
| "Invalid invitation token" | Token expired or used | Request new invitation |
| "Insufficient permissions" | Role too low for action | Contact owner/admin |
| "User already exists" | Email already registered | Use forgot password or different email |
| "Invalid token" | JWT expired | Refresh token or login again |

---

## 📚 Full Documentation

For complete details, see:
- **`docs/AUTH_FLOW_GUIDE.md`** - Complete authentication guide
- **`AUTH_IMPLEMENTATION_SUMMARY.md`** - Implementation summary

---

## 🎯 Typical Workflow

```
Day 1: Setup
├─ 1. Owner registers
├─ 2. Owner invites 2-3 admins
└─ 3. Admins register via invitation

Day 2-3: Team Building
├─ 4. Admins invite staff members
├─ 5. Staff members register
└─ 6. Start using the system

Ongoing:
├─ New staff? → Admin sends invitation
├─ Forgot password? → Use forgot password flow
├─ User left? → Admin deactivates user
└─ Role change? → Owner/Admin updates role
```

---

## ✅ Status Check

To verify everything is working:

```bash
# 1. Check server is running
curl http://localhost:3000/health

# 2. Try to register owner (should succeed first time)
curl -X POST http://localhost:3000/api/auth/register/owner \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"owner","password":"Test123!","firstName":"Test","lastName":"User"}'

# 3. Login with owner credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 4. Use returned token to test invitation
# (Replace YOUR_TOKEN with actual token from step 3)
curl -X POST http://localhost:3000/api/users/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email":"staff@test.com","role":"STAFF"}'
```

If all above work, your system is ready! 🎉

---

**Last Updated:** October 2024
**Version:** 2.0.0 (SaaS Auth Flow)

