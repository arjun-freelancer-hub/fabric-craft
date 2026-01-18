# Railway Deployment Guide

This guide will walk you through deploying the Fabric Craft application to Railway, a modern platform that makes it easy to deploy full-stack applications.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Overview](#overview)
3. [Step 1: Create Railway Account](#step-1-create-railway-account)
4. [Step 2: Create New Project](#step-2-create-new-project)
5. [Step 3: Deploy MySQL Database](#step-3-deploy-mysql-database)
6. [Step 4: Deploy Redis Service](#step-4-deploy-redis-service)
7. [Step 5: Deploy Backend Service](#step-5-deploy-backend-service)
8. [Step 6: Deploy Frontend Service](#step-6-deploy-frontend-service)
9. [Step 7: Run Database Migrations](#step-7-run-database-migrations)
10. [Step 8: Configure Custom Domains](#step-8-configure-custom-domains)
11. [Troubleshooting](#troubleshooting)
12. [Railway-Specific Considerations](#railway-specific-considerations)

## Prerequisites

Before starting, ensure you have:

- A Railway account ([railway.app](https://railway.app))
- Git repository with your code pushed to GitHub/GitLab/Bitbucket
- Basic understanding of environment variables
- Access to your domain DNS settings (for custom domains)

## Overview

Railway will deploy your application as four separate services:

1. **MySQL Database** - Managed MySQL service
2. **Redis** - Managed Redis service for caching
3. **Backend** - Node.js/Express API service
4. **Frontend** - Next.js frontend service

Railway automatically:
- Detects Node.js projects
- Builds Docker containers (or uses Nixpacks)
- Manages internal networking between services
- Provides HTTPS certificates
- Handles scaling and restarts

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up using GitHub, GitLab, or email
3. Complete the onboarding process

## Step 2: Create New Project

1. Click **"New Project"** in your Railway dashboard
2. Select **"Deploy from GitHub repo"** (or your Git provider)
3. Choose your repository
4. Railway will create a new project and attempt to detect services

## Step 3: Deploy MySQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway will provision a MySQL 8.0 database
4. Once created, click on the MySQL service
5. Go to the **"Variables"** tab
6. Note the following variables (Railway provides these automatically):
   - `MYSQL_HOST` (e.g., `containers-us-west-xxx.railway.app`)
   - `MYSQL_PORT` (usually `3306`)
   - `MYSQLDATABASE` (auto-generated database name)
   - `MYSQLUSER` (auto-generated user)
   - `MYSQLPASSWORD` (auto-generated password)
   - `MYSQL_URL` (full connection string)

**Important:** Save the `MYSQL_URL` or individual variables as you'll need them for the backend service.

## Step 4: Deploy Redis Service

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add Redis"**
3. Railway will provision a Redis service
4. Click on the Redis service
5. Go to the **"Variables"** tab
6. Note the `REDIS_URL` variable (Railway provides this automatically)

## Step 5: Deploy Backend Service

### 5.1 Create Backend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** and choose your repository
3. In the service settings, set the **Root Directory** to `backend`
4. Railway will auto-detect it as a Node.js service

### 5.2 Configure Build Settings

Railway will automatically detect your Dockerfile. If you want to customize:

1. Go to **Settings** → **Build**
2. **Build Command**: Leave empty (Dockerfile handles this)
3. **Start Command**: Leave empty (Dockerfile CMD handles this)
4. **Root Directory**: `backend`

### 5.3 Configure Environment Variables

Go to the backend service → **Variables** tab and add:

#### Required Variables

```env
# Environment
NODE_ENV=production
PORT=5001
APP_NAME=Tailor Bill Craft

# Database (use Railway MySQL service variables)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DATABASE_URL=${{MySQL.MYSQL_URL}}

# Redis (use Railway Redis service variable)
REDIS_URL=${{Redis.REDIS_URL}}

# Frontend URL (will update after frontend is deployed)
FRONTEND_URL=https://your-frontend-domain.railway.app

# JWT Configuration (generate strong secrets)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

#### Optional Variables

```env
# WhatsApp Integration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your_whatsapp_business_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Payment Gateway
PAYMENT_GATEWAY_URL=https://api.payment-gateway.com
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
PAYMENT_GATEWAY_SECRET=your_payment_gateway_secret

# Barcode Configuration
BARCODE_DEFAULT_FORMAT=CODE128
BARCODE_DEFAULT_WIDTH=2
BARCODE_DEFAULT_HEIGHT=100

# Email Configuration (Required for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Note:** Railway allows you to reference variables from other services using `${{ServiceName.VARIABLE_NAME}}` syntax. This creates automatic connections between services.

### 5.4 Configure Networking

1. Go to **Settings** → **Networking**
2. Enable **"Generate Domain"** to get a public URL
3. Note the generated domain (e.g., `backend-production.railway.app`)

### 5.5 Deploy

Railway will automatically:
- Build your Docker image using the `backend/Dockerfile`
- Deploy the container
- Run the application

Check the **"Deployments"** tab to see build logs and deployment status.

## Step 6: Deploy Frontend Service

### 6.1 Create Frontend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** and choose your repository
3. In the service settings, set the **Root Directory** to `frontend`
4. Railway will auto-detect it as a Next.js service

### 6.2 Configure Build Settings

1. Go to **Settings** → **Build**
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Root Directory**: `frontend`

### 6.3 Configure Environment Variables

Go to the frontend service → **Variables** tab and add:

```env
# Environment
NODE_ENV=production

# API URL (use backend service domain)
NEXT_PUBLIC_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api

# App Name
NEXT_PUBLIC_APP_NAME=Clothing Store
```

**Note:** If you've set up a custom domain for the backend, use that instead:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 6.4 Configure Networking

1. Go to **Settings** → **Networking**
2. Enable **"Generate Domain"** to get a public URL
3. Note the generated domain (e.g., `frontend-production.railway.app`)

### 6.5 Update Backend FRONTEND_URL

1. Go back to the backend service
2. Update the `FRONTEND_URL` variable with the frontend domain:
```env
FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

Or if using custom domain:
```env
FRONTEND_URL=https://yourdomain.com
```

### 6.6 Deploy

Railway will automatically build and deploy the Next.js application.

## Step 7: Run Database Migrations

After deploying the backend, you need to run Prisma migrations to set up the database schema.

### Option 1: Using Railway CLI (Recommended)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Link to your project:
```bash
railway link
```

4. Select your backend service

5. Run Prisma migrations:
```bash
railway run npx prisma migrate deploy
```

6. (Optional) Seed the database:
```bash
railway run npm run db:seed
```

### Option 2: Using Railway One-Click Shell

1. Go to your backend service in Railway dashboard
2. Click on **"Deployments"** tab
3. Click on the latest deployment
4. Click **"Shell"** button (opens a one-click shell)
5. Run:
```bash
npx prisma migrate deploy
npm run db:seed
```

### Option 3: Using Service Command

1. Go to backend service → **Settings** → **Deploy**
2. Under **"Run Command"**, temporarily add:
```
npx prisma migrate deploy && npm run db:seed && node -r module-alias/register dist/index.js
```
3. Redeploy the service
4. After successful migration, remove the migration commands

## Step 8: Configure Custom Domains

### 8.1 Backend Domain

1. Go to backend service → **Settings** → **Networking**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Railway will provide DNS records to add:
   - Type: `CNAME`
   - Name: `api` (or subdomain of choice)
   - Value: Railway-provided CNAME target
5. Add the DNS record in your domain registrar
6. Wait for DNS propagation (5-15 minutes)
7. Railway will automatically provision SSL certificate

### 8.2 Frontend Domain

1. Go to frontend service → **Settings** → **Networking**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
4. Add the provided DNS record
5. Wait for SSL certificate provisioning

### 8.3 Update Environment Variables

After setting up custom domains, update:

**Backend:**
```env
FRONTEND_URL=https://yourdomain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Redeploy both services after updating.

## Troubleshooting

### Backend Won't Start

**Check Build Logs:**
1. Go to backend service → **Deployments** tab
2. Click on the failed deployment
3. Review build logs for errors

**Common Issues:**
- Missing environment variables
- Database connection issues (check DB credentials)
- Prisma client not generated (should happen in Dockerfile)
- Port conflicts (ensure PORT=5001 matches Dockerfile EXPOSE)

### Frontend Build Fails

**Check Build Logs:**
1. Go to frontend service → **Deployments** tab
2. Review build errors

**Common Issues:**
- Missing `NEXT_PUBLIC_API_URL` variable
- Build command failing (check `next.config.js`)
- Out of memory during build (Railway free tier has limits)

**Solution:**
Increase build resources in Railway settings or optimize Next.js build.

### Database Connection Errors

**Symptoms:**
- Backend fails to start
- 500 errors on API calls
- Connection timeout errors in logs

**Solutions:**
1. Verify database variables are correctly referenced:
   ```env
   DATABASE_URL=${{MySQL.MYSQL_URL}}
   ```
2. Check that MySQL service is running (green status)
3. Ensure variables use Railway service reference syntax
4. Check backend logs for specific error messages

### Prisma Migration Issues

**Error: "Migration engine failed to connect"**

**Solution:**
1. Verify `DATABASE_URL` is set correctly
2. Ensure MySQL service is accessible
3. Check network connectivity between services

**Error: "Migration not found"**

**Solution:**
1. Ensure `prisma/migrations` folder is committed to Git
2. Verify Prisma schema is up to date
3. Run `prisma migrate deploy` in Railway shell

### File Uploads Not Persisting

**Important:** Railway's filesystem is **ephemeral**. Files uploaded to `./uploads` will be lost on redeploy.

**Solutions:**

1. **Use Railway Volumes (Recommended):**
   - Go to backend service → **Settings** → **Volumes**
   - Create a new volume
   - Mount it to `/app/uploads`
   - Files will persist across redeploys

2. **Use External Storage:**
   - AWS S3
   - Cloudinary
   - Railway Blob Storage
   - Update `UPLOAD_PATH` to use external storage

3. **Database Storage:**
   - Store small files as base64 in database
   - Not recommended for large files

### CORS Errors

**Symptoms:**
- Frontend can't make API requests
- Browser console shows CORS errors

**Solution:**
1. Verify `FRONTEND_URL` in backend matches actual frontend domain
2. Update CORS settings in backend if needed
3. Ensure frontend is using correct `NEXT_PUBLIC_API_URL`

## Railway-Specific Considerations

### Ephemeral Filesystem

Railway's filesystem is ephemeral, meaning:
- Files written to disk are lost on redeploy
- Logs are not persisted (use Railway's log viewer)
- Uploads should use volumes or external storage

**Persist Data:**
- Database: Use Railway MySQL (persistent)
- Files: Use Railway Volumes or external storage
- Logs: Use Railway's log aggregation or external logging service

### Build Process

Railway builds your application using:
1. Dockerfile (if present) - Used for backend/frontend
2. Nixpacks (if no Dockerfile) - Auto-detects and builds

**Backend:** Uses `backend/Dockerfile` (multi-stage build)
**Frontend:** Uses `frontend/Dockerfile` (multi-stage build)

### Environment Variables

Railway provides:
- Service references: `${{ServiceName.VARIABLE}}`
- Public domain variables: `RAILWAY_PUBLIC_DOMAIN`
- Private domain variables: `RAILWAY_PRIVATE_DOMAIN`

### Networking

- Services can communicate internally using service names
- Public domains are automatically provisioned with HTTPS
- Custom domains get automatic SSL certificates
- No need to configure ports manually (Railway handles routing)

### Scaling

Railway automatically:
- Restarts services on crash
- Provides health checks
- Supports horizontal scaling (paid plans)

### Resource Limits

**Free Tier:**
- $5 credit per month
- Limited build time
- Limited concurrent services

**Paid Plans:**
- Usage-based pricing
- More resources
- Better performance

### Monitoring

Railway provides:
- Deployment logs
- Real-time service logs
- Metrics dashboard
- Alerts and notifications

### Secrets Management

- All environment variables are encrypted at rest
- Variables can be marked as secrets (hidden in UI)
- Use Railway's secret management for sensitive data

## Best Practices

1. **Use Service References:** Always use `${{ServiceName.VARIABLE}}` for inter-service communication
2. **Separate Services:** Keep backend and frontend as separate services
3. **Environment Variables:** Never commit secrets to Git
4. **Database Migrations:** Run migrations as part of deployment or in one-click shell
5. **Volume Mounts:** Use volumes for persistent data (uploads, logs)
6. **Custom Domains:** Use custom domains for production
7. **Monitoring:** Set up alerts for service failures
8. **Backups:** Regularly backup your database (Railway MySQL backups available)

## Quick Reference: Environment Variables Summary

### Backend Service

```env
NODE_ENV=production
PORT=5001
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DATABASE_URL=${{MySQL.MYSQL_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
```

### Frontend Service

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
NEXT_PUBLIC_APP_NAME=Clothing Store
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord Community](https://discord.gg/railway)
- [Railway Status Page](https://status.railway.app)

## Support

If you encounter issues:

1. Check Railway's status page
2. Review service logs in Railway dashboard
3. Check Railway documentation
4. Join Railway Discord for community support
5. Open a support ticket in Railway dashboard

---

**Congratulations!** Your Fabric Craft application should now be running on Railway. 🚀
