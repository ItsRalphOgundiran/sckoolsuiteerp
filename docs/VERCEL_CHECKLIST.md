# Vercel Deployment Checklist

## Pre-Deployment Configuration Complete ✅

### 1. Files Updated for Vercel

| File | Changes Made |
|------|--------------|
| `prisma/schema.prisma` | PostgreSQL configuration with `directUrl` |
| `next.config.ts` | Image domains (Supabase, Cloudinary) + Prisma webpack alias |
| `package.json` | `vercel-build` script with migrations |
| `vercel.json` | Build commands and environment references |

### 2. Required Environment Variables (Set in Vercel Dashboard)

```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
NEXTAUTH_SECRET=openssl-rand-base64-32-output
NEXTAUTH_URL=https://your-project.vercel.app
NODE_ENV=production
```

### 3. Build Command (Automatic via vercel.json)

```bash
npm run vercel-build
```

This runs: `prisma generate && prisma migrate deploy && next build`

---

## Deployment Steps

### Step 1: Database Setup (Supabase)
1. Create project at https://supabase.com
2. Copy connection strings from Connect → ORMs → Prisma
3. Save both DATABASE_URL (pooler) and DIRECT_URL (direct)

### Step 2: Vercel Project Setup
1. Import GitHub repo at https://vercel.com
2. Framework: Next.js
3. Build Command: (auto-detected from vercel.json)
4. Add all 5 environment variables

### Step 3: First Deploy
1. Click Deploy
2. Wait for build (~3-5 minutes)
3. Visit `https://your-project.vercel.app/setup`
4. Complete 5-step wizard

---

## Critical Vercel-Specific Notes

### ⚠️ SQLite WILL NOT WORK on Vercel
- Vercel is serverless with ephemeral filesystem
- MUST use PostgreSQL (Supabase recommended)
- Schema already updated to PostgreSQL

### ⚠️ Connection Pooling REQUIRED
- Supabase free tier: 60 connections
- Vercel functions can spawn many instances
- `connection_limit=1` in DATABASE_URL is MANDATORY
- Use port 6543 (pooler), NOT 5432 (direct)

### ⚠️ Prisma Generate Must Run Before Build
- `vercel-build` script handles this
- `postinstall` also runs `prisma generate`
- Build will fail if Prisma client missing

### ⚠️ Migrations Run During Build
- `prisma migrate deploy` runs in vercel-build
- Database must be accessible during build
- Supabase IP must allow Vercel (0.0.0.0/0 or specific IPs)

---

## Troubleshooting Quick Fixes

| Error | Fix |
|-------|-----|
| "Can't reach database server" | Check Supabase IP allowlist, verify connection string |
| "PrismaClientInitializationError" | Ensure `prisma generate` ran before build |
| "Table not found" | Migrations failed - check build logs |
| Auth not working | Verify NEXTAUTH_URL matches domain exactly |
| "Too many connections" | Ensure `connection_limit=1` in DATABASE_URL |

---

## Post-Deploy Verification

- [ ] Visit `/setup` and complete wizard
- [ ] School activates successfully
- [ ] Admin user created
- [ ] Login works with new credentials
- [ ] Dashboard loads without errors
- [ ] All CRUD operations work

---

**Full Guide:** Open `docs/VERCEL_DEPLOYMENT_GUIDE.html` in browser → Save as PDF
