# SckoolSuite ERP Documentation

## 📚 Available Guides

### 1. Production Deployment Guide (PDF)
**File:** `SCKOOLSUITE_PRODUCTION_GUIDE.html`

Complete step-by-step guide for deploying to production with PostgreSQL:
- Open the HTML file in your browser
- Click "Download / Print PDF" button to save as PDF
- Covers Railway, Supabase, and self-hosted options

### 2. Environment Template
**File:** `env.template`

Copy to `.env.local` and fill in your values:
```bash
cp env.template .env.local
```

### 3. Quick Start

#### For Development:
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.template .env.local
# Edit .env.local with your values

# 3. Run migrations
npx prisma migrate deploy

# 4. Start development
npm run dev

# 5. Visit http://localhost:3000/setup
```

#### For Production:
See the full Production Deployment Guide HTML file for detailed instructions.

## 🔧 Common Commands

```bash
# Database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database (DANGER!)

# Deployment
npm run deploy:vercel   # Deploy to Vercel
npm run deploy:railway  # Deploy to Railway
```

## 📖 Support

For detailed instructions, open `SCKOOLSUITE_PRODUCTION_GUIDE.html` in your browser.
