# Database Setup Guide

## Quick Setup Instructions

Since your system requires a MySQL/MariaDB password, please follow these steps:

### 1. Connect to MySQL/MariaDB
```bash
# Try MariaDB first (recommended for Manjaro)
mariadb -u root -p

# Or try MySQL
mysql -u root -p
```

### 2. Create Database
Once connected, run:
```sql
CREATE DATABASE clothing_store;
SHOW DATABASES;
EXIT;
```

### 3. Update Environment File
Edit `backend/.env` and update the database password:
```bash
# If you have a password, update these lines:
DB_PASSWORD=your_actual_password
DATABASE_URL="mysql://root:your_actual_password@localhost:3306/clothing_store"

# If no password, keep as:
DB_PASSWORD=
DATABASE_URL="mysql://root:@localhost:3306/clothing_store"
```

### 4. Complete Backend Setup
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Start the Application
```bash
cd ..
npm run dev
```

## Alternative: Use SQLite (No Password Required)

If you prefer to use SQLite instead of MySQL/MariaDB:

### 1. Update Prisma Schema
Edit `backend/prisma/schema.prisma` and change:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Update Environment
Edit `backend/.env`:
```
DATABASE_URL="file:./dev.db"
```

### 3. Setup Database
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

## Troubleshooting

### Common Issues:
1. **Access Denied**: Make sure you're using the correct MySQL/MariaDB password
2. **Database Not Found**: Ensure the database was created successfully
3. **Connection Refused**: Check if MySQL/MariaDB service is running

### Check MySQL/MariaDB Status:
```bash
# For MariaDB
sudo systemctl status mariadb

# For MySQL
sudo systemctl status mysql
```

### Start MySQL/MariaDB Service:
```bash
# For MariaDB
sudo systemctl start mariadb

# For MySQL
sudo systemctl start mysql
```

## Default Admin Credentials
- **Email**: admin@clothingstore.com
- **Password**: Admin123!

## Application URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/health
