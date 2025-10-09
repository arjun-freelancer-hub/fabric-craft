# Authentication & Authorization Flow Guide

## Overview

This application implements a secure SaaS authentication system with role-based access control (RBAC) and hierarchical permissions.

## Role Hierarchy

```
OWNER (Level 3) - Full system access
  └─> ADMIN (Level 2) - Can manage STAFF
       └─> STAFF (Level 1) - Can manage invoices/bills
```

### Role Permissions

#### OWNER
- Full access to all system features
- Can invite and manage ADMIN and STAFF users
- Can change passwords for ADMIN and STAFF
- Can change roles of ADMIN and STAFF
- Cannot be created after initial setup

#### ADMIN
- Can invite and manage STAFF users
- Can change passwords for STAFF
- Can change roles of STAFF (within allowed roles)
- Can view and manage system data
- Full access to invoices, customers, products

#### STAFF
- Can create and manage invoices/bills
- Can view and manage customers
- Can view products
- Limited access to system features

---

## Authentication Flows

### 1. Owner Registration (First-Time Setup)

**Endpoint:** `POST /api/auth/register/owner`

**When:** Only when no owner exists in the system

**Request:**
```json
{
  "email": "owner@example.com",
  "username": "owner",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "owner@example.com",
      "username": "owner",
      "firstName": "John",
      "lastName": "Doe",
      "role": "OWNER"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "message": "Owner registration successful"
}
```

**Notes:**
- Only works if no owner exists
- Automatically creates user with OWNER role
- Returns authentication tokens
- After owner is created, this endpoint will return 403

---

### 2. User Invitation Flow

#### Step 1: Send Invitation (Owner/Admin)

**Endpoint:** `POST /api/users/invite`

**Permissions:** OWNER can invite ADMIN/STAFF, ADMIN can invite STAFF

**Request:**
```json
{
  "email": "newuser@example.com",
  "role": "ADMIN" // or "STAFF"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "...",
      "email": "newuser@example.com",
      "role": "ADMIN",
      "expiresAt": "2024-01-15T10:00:00Z",
      "status": "PENDING"
    },
    "invitationLink": "http://yourapp.com/register/invite/abc123..." // Dev only
  },
  "message": "Invitation sent successfully"
}
```

**Notes:**
- Invitation expires in 7 days by default
- Email should be sent to the invited user (TODO: implement email service)
- One active invitation per email at a time

#### Step 2: Verify Invitation Token

**Endpoint:** `GET /api/auth/invite/verify/:token`

**Request:** No body, token in URL

**Response:**
```json
{
  "success": true,
  "data": {
    "invitation": {
      "email": "newuser@example.com",
      "role": "ADMIN",
      "expiresAt": "2024-01-15T10:00:00Z"
    }
  },
  "message": "Invitation is valid"
}
```

#### Step 3: Register with Invitation

**Endpoint:** `POST /api/auth/register/invite`

**Request:**
```json
{
  "token": "invitation-token-from-email",
  "username": "newadmin",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "newuser@example.com",
      "username": "newadmin",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "message": "Registration successful"
}
```

**Notes:**
- Email is taken from invitation token
- Role is assigned from invitation
- User is automatically logged in
- Invitation is marked as ACCEPTED

#### Managing Invitations

**Get All Invitations:** `GET /api/users/invitations`
- Owner sees all invitations
- Admin sees only their sent invitations
- Supports filtering by status and role

**Cancel Invitation:** `DELETE /api/users/invitations/:id`
- Can only cancel invitations you sent
- Owner can cancel any invitation

---

### 3. Login Flow

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "message": "Login successful"
}
```

**Validations:**
- Email must be registered
- Account must be active
- Password must match

---

### 4. Forgot Password Flow

#### Step 1: Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent",
  "data": { // Dev only
    "resetLink": "http://yourapp.com/reset-password/xyz789...",
    "token": "xyz789..."
  }
}
```

**Notes:**
- Response doesn't reveal if email exists (security)
- Reset token expires in 1 hour
- Previous unused tokens are invalidated
- TODO: Send email with reset link

#### Step 2: Verify Reset Token

**Endpoint:** `GET /api/auth/reset-password/verify/:token`

**Request:** No body, token in URL

**Response:**
```json
{
  "success": true,
  "message": "Reset token is valid"
}
```

#### Step 3: Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Notes:**
- Token is marked as used after successful reset
- User must log in again with new password

---

### 5. Change Own Password (Authenticated)

**Endpoint:** `POST /api/auth/change-password`

**Headers:** `Authorization: Bearer <access-token>`

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Notes:**
- Requires current password verification
- User remains logged in

---

### 6. Admin/Owner Changes User Password

**Endpoint:** `POST /api/users/:userId/change-password`

**Permissions:** 
- OWNER can change password for ADMIN and STAFF
- ADMIN can change password for STAFF

**Headers:** `Authorization: Bearer <access-token>`

**Request:**
```json
{
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Notes:**
- Does NOT require current password
- Target user is logged out (tokens remain valid until expiry)
- Hierarchical permission check is enforced

---

### 7. Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token"
    }
  },
  "message": "Token refreshed successfully"
}
```

---

### 8. Update User Role

**Endpoint:** `PATCH /api/users/:userId/role`

**Permissions:**
- OWNER can change any role
- ADMIN can only change STAFF roles
- Cannot assign roles higher than your own

**Headers:** `Authorization: Bearer <access-token>`

**Request:**
```json
{
  "role": "ADMIN" // or "STAFF"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "role": "ADMIN",
      ...
    }
  },
  "message": "User role updated successfully"
}
```

---

## Password Requirements

All passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Regex:** `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`

---

## Token Management

### Access Token
- **Expiry:** 24 hours (configurable via JWT_EXPIRES_IN)
- **Usage:** Include in Authorization header for all protected endpoints
- **Format:** `Authorization: Bearer <access-token>`

### Refresh Token
- **Expiry:** 7 days (configurable via JWT_REFRESH_EXPIRES_IN)
- **Usage:** Used to obtain new access/refresh token pair
- **Storage:** Store securely (httpOnly cookie recommended for web apps)

---

## Authorization Checks

### Role-Based Access Control (RBAC)

#### Method 1: Specific Roles
```typescript
AuthMiddleware.authorize(UserRole.ADMIN, UserRole.OWNER)
```
Allows only specified roles.

#### Method 2: Minimum Role (Hierarchical)
```typescript
AuthMiddleware.requireMinRole(UserRole.ADMIN)
```
Allows ADMIN and all roles above (OWNER).

### User Management Checks

```typescript
AuthMiddleware.canManageUser(managerId, targetUserId, prisma)
```
- Returns true if manager can manage target user
- OWNER can manage everyone
- ADMIN can manage STAFF
- Same or lower role cannot be managed

### Invitation Checks

```typescript
AuthMiddleware.canInviteRole(inviterRole, inviteeRole)
```
- Can only invite users with lower hierarchy level
- OWNER can invite ADMIN and STAFF
- ADMIN can invite STAFF only

---

## Security Best Practices

### Implemented
✅ Password hashing with bcrypt (10 rounds)
✅ JWT-based authentication
✅ Role-based access control
✅ Hierarchical permissions
✅ Token expiration
✅ Password complexity requirements
✅ Invitation token expiration
✅ Reset token expiration and one-time use
✅ Account deactivation support
✅ Audit logging for sensitive operations

### TODO / Recommended
⚠️ Implement email service for invitations and password resets
⚠️ Add rate limiting for login/registration endpoints
⚠️ Implement token blacklisting for logout
⚠️ Add 2FA (Two-Factor Authentication)
⚠️ Implement session management
⚠️ Add IP-based restrictions
⚠️ Implement account lockout after failed attempts
⚠️ Add email verification for new accounts
⚠️ Store refresh tokens in database with revocation support

---

## API Endpoints Summary

### Public Endpoints (No Authentication)
- `POST /api/auth/login` - Login
- `POST /api/auth/register/owner` - Register owner (first-time only)
- `POST /api/auth/register/invite` - Register with invitation
- `GET /api/auth/invite/verify/:token` - Verify invitation token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/reset-password/verify/:token` - Verify reset token
- `POST /api/auth/refresh` - Refresh access token

### Authenticated Endpoints (Require Login)

#### Profile Management
- `GET /api/auth/profile` - Get own profile
- `PUT /api/auth/profile` - Update own profile
- `POST /api/auth/change-password` - Change own password
- `GET /api/auth/verify` - Verify token validity
- `POST /api/auth/logout` - Logout

#### User Management (ADMIN+)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (deprecated, use invite instead)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user
- `GET /api/users/search/:query` - Search users
- `GET /api/users/stats/overview` - User statistics

#### Invitation Management (ADMIN+)
- `POST /api/users/invite` - Send invitation
- `GET /api/users/invitations` - List invitations
- `DELETE /api/users/invitations/:id` - Cancel invitation

#### Password Management (ADMIN+)
- `POST /api/users/:id/change-password` - Change user password

#### Role Management (ADMIN+)
- `PATCH /api/users/:id/role` - Update user role

---

## Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Validation failed, invalid input |
| 401 | Unauthorized | Invalid credentials, token expired |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User/resource not found |
| 409 | Conflict | User already exists, duplicate email |
| 500 | Server Error | Internal server error |

---

## Testing the Flow

### 1. Setup Owner Account
```bash
curl -X POST http://localhost:3000/api/auth/register/owner \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "username": "owner",
    "password": "Owner123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Owner Invites Admin
```bash
curl -X POST http://localhost:3000/api/users/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <owner-access-token>" \
  -d '{
    "email": "admin@example.com",
    "role": "ADMIN"
  }'
```

### 3. Admin Registers with Invitation
```bash
curl -X POST http://localhost:3000/api/auth/register/invite \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<invitation-token>",
    "username": "admin",
    "password": "Admin123!",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### 4. Admin Invites Staff
```bash
curl -X POST http://localhost:3000/api/users/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-access-token>" \
  -d '{
    "email": "staff@example.com",
    "role": "STAFF"
  }'
```

---

## Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=mysql://user:password@localhost:3306/dbname

# Node Environment
NODE_ENV=development
```

---

## Migration Guide

If you're updating from the old system:

1. **Backup your database**
2. **Run Prisma migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_saas_auth_flow
   ```
3. **Update existing users:**
   - First registered user should be promoted to OWNER
   - Other admins can be kept as ADMIN
   - Regular users become STAFF

4. **Update frontend:**
   - Change registration flow to use invitation system
   - Add forgot password UI
   - Update role labels (remove MANAGER, CASHIER)

5. **Update API calls:**
   - Replace `/register` with `/register/owner` (first-time only)
   - Implement invitation flow for new users
   - Update role checks in frontend

---

## Support

For issues or questions:
- Check this documentation
- Review code comments
- Check logs in `backend/logs/app.log`
- Review Prisma schema: `backend/prisma/schema.prisma`

