# SckoolSuite ERP - Production Database Setup Guide

## Overview

This guide helps you migrate from SQLite to a production-ready PostgreSQL database server and deploy SckoolSuite ERP to production environments.

---

## Recommended Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | PostgreSQL 15+ | Primary data store |
| Hosting | Vercel / Railway / Render | Application hosting |
| Database Hosting | Railway / Render / Supabase | Managed PostgreSQL |
| File Storage | Cloudinary / AWS S3 | Image/document uploads |
| Cache (Optional) | Redis | Session management |

---

## Option 1: Railway (Recommended for Beginners)

Railway offers the easiest managed PostgreSQL with zero configuration.

### Step 1: Create Railway Account
1. Visit https://railway.app
2. Sign up with GitHub
3. Create a new project

### Step 2: Add PostgreSQL Database
```bash
# In Railway Dashboard:
1. Click "New" → "Database" → "Add PostgreSQL"
2. Wait for database to provision (1-2 minutes)
3. Click on the PostgreSQL service
4. Go to "Connect" tab
5. Copy the "DATABASE_URL" connection string
```

### Step 3: Update Environment Variables
Create `.env.production`:
```env
# Database - Railway PostgreSQL
DATABASE_URL="postgresql://username:password@containers.railway.app:5432/railway"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"

# Optional: File Upload
CLOUDINARY_CLOUD_NAME="your-cloud-name"
UPLOAD_PRESET="sckoolsuite"
```

### Step 4: Update Prisma Schema
Edit `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL") // For migrations
}
```

### Step 5: Run Migrations
```bash
# Install PostgreSQL dependencies
npm install @prisma/client

# Generate Prisma client for PostgreSQL
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Step 6: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

---

## Option 2: Supabase (Enterprise-Grade)

Best for schools requiring high availability and compliance.

### Step 1: Create Supabase Project
```bash
1. Visit https://supabase.com
2. Create new project
3. Choose region closest to your users
4. Save the database password securely
```

### Step 2: Get Connection String
```bash
# In Supabase Dashboard:
1. Go to Project Settings → Database
2. Copy "Connection string" → "URI"
3. Format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

### Step 3: Configure Connection Pooling (Recommended)
```env
# Transaction mode (for queries)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct mode (for migrations)
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
```

Update `schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 4: Run Initial Setup
```bash
# Set environment variable temporarily
export DATABASE_URL="your-supabase-url"

# Deploy migrations
npx prisma migrate deploy

# Optional: Seed initial data
npx tsx scripts/setup-production.ts
```

---

## Option 3: Self-Hosted PostgreSQL (VPS)

For maximum control and data sovereignty.

### Server Requirements
- **CPU:** 2+ cores
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 50GB SSD minimum
- **OS:** Ubuntu 22.04 LTS

### Installation Steps

#### 1. Install PostgreSQL
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE sckoolsuite;

# Create user
CREATE USER sckooladmin WITH ENCRYPTED PASSWORD 'your-secure-password';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sckoolsuite TO sckooladmin;

# Exit
\q
```

#### 3. Configure Remote Access
```bash
# Edit configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Change:
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add at the end:
host  all  all  0.0.0.0/0  md5

# Restart
sudo systemctl restart postgresql
```

#### 4. Firewall Configuration
```bash
# Allow PostgreSQL port
sudo ufw allow 5432/tcp
sudo ufw reload
```

#### 5. Environment Variables
```env
DATABASE_URL="postgresql://sckooladmin:your-secure-password@your-server-ip:5432/sckoolsuite"
```

---

## Application Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Configure project
vercel

# 4. Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 5. Deploy
vercel --prod
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | Optional | Direct connection for migrations (Supabase) |
| `NEXTAUTH_SECRET` | Yes | Random 32+ character string |
| `NEXTAUTH_URL` | Yes | Your production domain |
| `CLOUDINARY_CLOUD_NAME` | Optional | For image uploads |

---

## Database Migration from SQLite

If you have existing SQLite data:

```bash
# 1. Export from SQLite
npx prisma db pull --schema=schema.sqlite.prisma
sqlite3 prisma/dev.db .dump > dump.sql

# 2. Convert to PostgreSQL (manual adjustments needed)
# Remove SQLite-specific syntax
# Adjust sequences and constraints

# 3. Import to PostgreSQL
psql $DATABASE_URL < dump.sql
```

**Note:** For production, it's recommended to start fresh with the new `/setup` wizard.

---

## Security Checklist

- [ ] PostgreSQL not exposed to internet (use private networking)
- [ ] Strong database password (32+ characters)
- [ ] Database user has minimal required permissions
- [ ] SSL/TLS enabled for database connections
- [ ] Regular automated backups configured
- [ ] NEXTAUTH_SECRET is cryptographically random
- [ ] Environment variables not committed to git

---

## Troubleshooting

### Connection Refused
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check port
sudo netstat -plntu | grep 5432
```

### Migration Failures
```bash
# Reset and retry
npx prisma migrate reset --force
npx prisma migrate deploy
```

### Performance Issues
```sql
-- Add indexes for common queries
CREATE INDEX idx_students_school ON "Student"(schoolId);
CREATE INDEX idx_payments_school ON "Payment"(schoolId);
CREATE INDEX idx_invoices_school ON "Invoice"(schoolId);
```

---

## Support

For issues with this setup:
1. Check Railway/Supabase documentation
2. Review Prisma PostgreSQL docs: https://pris.ly/d/postgres
3. Verify environment variables are correctly set

---

**Document Version:** 1.0  
**Last Updated:** June 2026
