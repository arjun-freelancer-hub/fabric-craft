# 🏢 Multi-Tenant Tailor Shop Management System

> A complete SaaS platform for clothing stores with workspace isolation, team collaboration, and role-based access control.

## ✨ Features

- 🏢 **Multi-Tenant Workspaces** - Each user gets their own workspace
- 👥 **Team Collaboration** - Invite up to 2 members per workspace (3 total)
- 🔐 **Role-Based Access** - OWNER, ADMIN, MEMBER roles per workspace
- 🔄 **Workspace Switching** - Work across multiple workspaces
- 📊 **Complete Data Isolation** - Each workspace has separate data
- 💪 **Redux State Management** - Scalable architecture
- 🎨 **Beautiful UI** - Modern design with shadcn/ui
- 📱 **Responsive** - Works on all devices

## 🚀 Quick Start

### Prerequisites

**For Docker (Recommended):**
- Docker 20.10+
- Docker Compose 2.0+

**For Manual Setup:**
- Node.js 18+
- MySQL 8+
- npm or bun

### Installation with Docker Compose

```bash
# Clone repository
git clone <your-repo>
cd fabric-craft

# Start all services
docker-compose up -d

# Wait for services to be ready, then access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Manual Installation

```bash
# Clone repository
git clone <your-repo>
cd neel-shurti

# Backend setup
cd backend
npm install
cp env.example .env
# Configure DATABASE_URL and JWT secrets in .env
npx prisma db push
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
cp env.local.example .env.local
# Configure NEXT_PUBLIC_API_URL in .env.local
npm run dev
```

### Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 📖 Documentation

Comprehensive guides in `docs/` folder:
- **[docs/INSTALLATION.md](docs/INSTALLATION.md)** - Installation guide
- **[docs/USAGE_GUIDE.md](docs/USAGE_GUIDE.md)** - Usage guide
- **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API documentation
- **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Testing guide

## 🎯 How It Works

### 1. Register & Get Workspace
Any user can register and automatically gets their own workspace where they are the OWNER.

```
User A registers → "A's Tailor Shop" workspace created → User A is OWNER
User B registers → "B's Boutique" workspace created → User B is OWNER
```

### 2. Invite Team Members
Owners and Admins can invite up to 2 members per workspace (3 total including owner).

```
User A invites User B → B accepts → B joins "A's Tailor Shop" as MEMBER
```

### 3. Work Across Workspaces
Users can belong to multiple workspaces and switch between them.

```
User B now has:
  - "B's Boutique" (OWNER) - Full control
  - "A's Tailor Shop" (MEMBER) - Limited access
```

### 4. Manage Roles
Owners can upgrade members from MEMBER to ADMIN.

```
Owner upgrades MEMBER → ADMIN → Can now invite and manage team
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** MySQL
- **Auth:** JWT (access + refresh tokens)
- **Validation:** express-validator

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State:** Redux Toolkit
- **Forms:** React Hook Form + Zod
- **UI:** Tailwind CSS + shadcn/ui
- **HTTP:** Axios

## 📊 Database Schema

```
organizations (workspaces)
├── organization_members (user-workspace relationships)
├── invitations (workspace invitations)
├── users (user accounts)
├── bills (workspace-scoped)
├── products (workspace-scoped)
├── customers (workspace-scoped)
└── categories (workspace-scoped)
```

## 🔐 Security

- ✅ bcrypt password hashing
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Password complexity requirements
- ✅ Invitation token expiration
- ✅ Password reset tokens (1-hour expiry)
- ✅ Complete data isolation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register + create workspace
- `POST /api/auth/login` - Login + get workspaces
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/accept-invitation` - Accept workspace invitation

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `POST /api/workspaces/:id/invite` - Invite member
- `PATCH /api/workspaces/:id/members/:userId/role` - Update role
- `DELETE /api/workspaces/:id/members/:userId` - Remove member

### Business Operations
- Products, Categories, Customers, Bills, Inventory, Reports, Settings
- All endpoints support multi-tenant context via `X-Organization-Id` header

## 🎨 Screenshots

### Registration with Workspace
![Registration](docs/screenshots/registration.png)

### Workspace Selector
![Workspace Selector](docs/screenshots/workspace-selector.png)

### Team Management
![Team Management](docs/screenshots/team-management.png)

## 👥 Roles & Permissions

| Permission | OWNER | ADMIN | MEMBER |
|------------|-------|-------|--------|
| Invite members | ✅ | ✅ | ❌ |
| Manage roles | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Create/Edit data | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ |

## 🧪 Testing

### Manual Testing
```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev

# Open http://localhost:3000/auth/register
# Register user and test flows
```

### Test Scenarios
1. ✅ Register new user → workspace created
2. ✅ Login → see workspaces
3. ✅ Invite member → check 3-person limit
4. ✅ Accept invitation → join workspace
5. ✅ Switch workspaces → data isolation
6. ✅ Upgrade role → MEMBER → ADMIN
7. ✅ Forgot password → reset flow

## 📦 Deployment

### Using Docker Compose (Recommended)

The easiest way to run the entire application is using Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers after code changes
docker-compose up -d --build

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MySQL: localhost:3306
- Redis: localhost:6379

**Environment Variables:**
Create a `.env` file in the project root (optional):
```env
DB_NAME=clothing_store
DB_USER=clothing_store_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Clothing Store
```

### Manual Deployment

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - See LICENSE file

## 👨‍💻 Author

Built with ❤️ for modern tailor shops

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Redux Toolkit for state management
- shadcn/ui for beautiful components
- Prisma for excellent ORM

---

## 🎊 Status: Production Ready!

✅ Backend: Compiled & Running  
✅ Frontend: Built Successfully  
✅ Database: Schema Applied  
✅ Redux: Configured  
✅ All Features: Implemented  

**Start the servers and begin using your multi-tenant SaaS platform!** 🚀

---

For detailed documentation, see the `docs/` folder.
