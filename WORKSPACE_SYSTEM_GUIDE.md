# Multi-Tenant Workspace System Guide

## 🏢 System Overview

This is a **multi-tenant SaaS application** where:
- **Any user can register** and automatically becomes the **OWNER** of their own workspace
- Each workspace owner can **invite up to 2 people** to join their workspace
- Users can be members of **multiple workspaces**
- Each workspace has its own **separate data** (bills, customers, products, etc.)

---

## 🎯 How It Works

### 1. User Registration
```
User A registers → Creates "Workspace A" → User A is OWNER of Workspace A
User B registers → Creates "Workspace B" → User B is OWNER of Workspace B
User C registers → Creates "Workspace C" → User C is OWNER of Workspace C
```

**Every user who registers gets their own workspace automatically!**

### 2. Inviting Team Members
```
User A (Owner of Workspace A) can invite:
├─ User D (joins as MEMBER of Workspace A)
└─ User E (joins as MEMBER of Workspace A)
```

**Limit: Maximum 2 invitations per workspace** (2 members + 1 owner = 3 total)

### 3. Multiple Workspace Membership
```
User D can be:
├─ MEMBER of Workspace A (invited by User A)
├─ MEMBER of Workspace B (invited by User B)
└─ OWNER of Workspace D (their own workspace)
```

**Users can belong to multiple workspaces with different roles!**

---

## 🗂️ Data Isolation

### Each Workspace Has Separate:
- ✅ Customers
- ✅ Products & Categories
- ✅ Bills & Invoices
- ✅ Inventory
- ✅ Team Members (owner + up to 2 members)

### Shared Across System:
- ✅ User accounts (email, password, profile)
- ✅ Login credentials

---

## 👥 Roles & Permissions

### OWNER (Per Workspace)
- Full control of their workspace
- Can invite up to 2 members
- Can remove members
- Can manage all workspace data
- Can delete workspace

### MEMBER
- Can access workspace data
- Can create/edit bills, customers, products
- Cannot invite other members
- Cannot delete workspace

---

## 🔄 Workflow Examples

### Example 1: Tailor Shop Owner
```
1. Raj registers → Creates "Raj's Tailoring" workspace
2. Raj invites:
   - Amit (staff) → MEMBER
   - Priya (accountant) → MEMBER
3. All three can access "Raj's Tailoring" data
4. Amit and Priya cannot invite more people
```

### Example 2: Freelance Tailor
```
1. Sita registers → Creates "Sita's Boutique" workspace
2. Sita works alone (doesn't invite anyone)
3. Sita manages all data herself
```

### Example 3: Working in Multiple Shops
```
1. Kumar registers → Creates "Kumar's Fashion" (OWNER)
2. Kumar is invited to "Raj's Tailoring" (MEMBER)
3. Kumar switches between:
   - His own workspace (full control)
   - Raj's workspace (limited to assigned tasks)
```

---

## 🚀 Registration Flow

### Step 1: User Signs Up
```
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "user123",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "John's Tailoring Shop"
}
```

**What Happens:**
1. User account created
2. Workspace created automatically
3. User added as OWNER of workspace
4. User logged in automatically

### Step 2: Owner Invites Members
```
POST /api/workspaces/:workspaceId/invite
{
  "email": "member@example.com"
}
```

**Limitations:**
- Maximum 2 active invitations per workspace
- Maximum 2 accepted members per workspace
- Can't invite if limit reached

### Step 3: Member Accepts Invitation
```
POST /api/auth/accept-invitation
{
  "token": "invitation-token-from-email"
}
```

**If user doesn't have account:**
1. They register first
2. Then accept invitation
3. Join workspace as MEMBER

**If user already has account:**
1. They just accept invitation
2. Workspace added to their list

---

## 🔐 Login & Workspace Selection

### Login Process
```
1. User logs in with email/password
2. Backend returns:
   - User info
   - List of workspaces they belong to
3. Frontend shows workspace selector
4. User selects workspace to work in
```

### Workspace Selector UI
```
┌─────────────────────────────────────┐
│  Select Workspace                   │
├─────────────────────────────────────┤
│  🏢 My Shop (OWNER)                 │
│     - 2 members                     │
│                                     │
│  🏢 Raj's Tailoring (MEMBER)        │
│     - 3 members                     │
│                                     │
│  🏢 Fashion Hub (MEMBER)            │
│     - 2 members                     │
└─────────────────────────────────────┘
```

---

## 📊 Database Structure

### Organizations Table
```sql
- id: unique workspace ID
- name: workspace name
- ownerId: who created this workspace
- isActive: soft delete flag
```

### Organization Members Table
```sql
- organizationId: which workspace
- userId: which user
- role: OWNER or MEMBER
- joinedAt: when they joined
```

### All Data Tables Include:
```sql
- organizationId: which workspace this data belongs to
```

**This ensures complete data isolation between workspaces!**

---

## 🎨 Frontend Implementation

### Required Components

1. **Registration Page** `/auth/register`
   - Email, password, name fields
   - **Workspace name field** (new!)
   - Creates user + workspace

2. **Workspace Selector** (After login)
   - Shows all workspaces user belongs to
   - Displays role (OWNER/MEMBER)
   - Switch between workspaces

3. **Invite Members Page** (Owner only)
   - Input: email address
   - Shows: current members (2/2)
   - Disabled if limit reached

4. **Workspace Settings** (Owner only)
   - Rename workspace
   - View members
   - Remove members
   - Delete workspace

---

## 🔧 API Endpoints

### Registration
```
POST /api/auth/register
- Creates user + workspace
- User becomes owner

POST /api/auth/login
- Returns user + workspaces list
```

### Workspace Management
```
GET /api/workspaces
- List user's workspaces

GET /api/workspaces/:id
- Get workspace details

POST /api/workspaces
- Create new workspace (user becomes owner)

PATCH /api/workspaces/:id
- Update workspace (owner only)

DELETE /api/workspaces/:id
- Delete workspace (owner only)
```

### Invitations
```
POST /api/workspaces/:id/invite
- Send invitation (owner only)
- Check 2-person limit

GET /api/workspaces/:id/invitations
- List pending invitations

DELETE /api/invitations/:id
- Cancel invitation

POST /api/auth/accept-invitation
- Accept invitation token
```

### Members
```
GET /api/workspaces/:id/members
- List workspace members

DELETE /api/workspaces/:id/members/:userId
- Remove member (owner only)
```

---

## ⚙️ Environment Variables

```env
# Workspace Limits
MAX_MEMBERS_PER_WORKSPACE=2
INVITATION_EXPIRY_DAYS=7

# Other configs
JWT_SECRET=your-secret
DATABASE_URL=mysql://...
```

---

##  Implementation Checklist

### Backend
- [x] Update Prisma schema with Organization model
- [ ] Create OrganizationModel
- [ ] Update AuthController - register creates workspace
- [ ] Update InvitationModel - add workspace context
- [ ] Add invitation limit check (max 2 per workspace)
- [ ] Create workspace management endpoints
- [ ] Add workspace context to all data queries
- [ ] Update middleware to include workspace check

### Frontend
- [ ] Add workspace name field to registration
- [ ] Create workspace selector component
- [ ] Update API calls to include workspace context
- [ ] Create invite members page
- [ ] Create workspace settings page
- [ ] Show workspace indicator in UI
- [ ] Add workspace switching functionality

---

## 🎯 Key Differences from Previous System

| Feature | Old System | New System |
|---------|-----------|------------|
| Registration | Only owner can register first | Anyone can register |
| Workspace | Single workspace | Multiple workspaces |
| Owner | One owner total | One owner per workspace |
| Team Size | Unlimited | Owner + 2 members max |
| Data | Shared | Isolated per workspace |
| User Roles | OWNER > ADMIN > STAFF | OWNER or MEMBER per workspace |

---

## 💡 Use Cases

### 1. Individual Tailors
- Register own workspace
- Work alone or with 1-2 helpers
- Keep data private

### 2. Tailor Working Multiple Shops
- Own workspace for personal work
- Member of 2-3 other shops
- Switch between workspaces

### 3. Small Tailor Shop
- Owner + 2 staff members
- All access same customer/product data
- Owner controls access

---

## 🚨 Important Notes

1. **Invitation Limit**: Hard limit of 2 members per workspace
2. **Data Isolation**: Users CANNOT see data from other workspaces
3. **Workspace Switching**: Must select workspace after login
4. **Owner Privileges**: Only owner can invite/remove members
5. **Multiple Ownership**: User can own multiple workspaces (their own + any they create)

---

## 📝 Next Steps

1. Run Prisma migration to create new tables
2. Implement OrganizationModel and workspace logic
3. Update all controllers to include workspace context
4. Build frontend workspace selector
5. Test multi-tenant isolation
6. Add workspace limits enforcement

---

**Status:** Schema updated ✅ | Implementation in progress ⏳

This system provides true multi-tenancy with data isolation while allowing users to work across multiple workspaces!

