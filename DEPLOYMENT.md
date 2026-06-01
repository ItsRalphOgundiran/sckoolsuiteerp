Vercel deployment notes
======================

Quick checklist
- Use a production-ready database (do NOT use SQLite on Vercel). Set `DATABASE_URL` to your Postgres/MySQL connection string (Vercel Postgres recommended).
- Set `NEXTAUTH_URL` to your deployed site URL (e.g. `https://your-app.vercel.app`).
- Set `NEXTAUTH_SECRET` (strong random value). NextAuth uses this to encrypt sessions.
- Optionally set `NEXT_PUBLIC_APP_URL` / `APP_URL` to the public site URL.
- Optionally set `EMAIL_WEBHOOK_URL` if you use email webhooks.

Recommended Vercel project settings
- Framework Preset: Next.js (auto-detected)
- Install Command: `npm ci` (or leave default)
- Build Command: `npx prisma generate && npm run build`
- Output Directory: leave blank (Vercel detects Next.js automatically)

Prisma & migrations
- Ensure `DATABASE_URL` is available at build time if you want to run `prisma migrate deploy` during build.
- Typical build sequence (set as build command):
  - `npx prisma generate` (generates the Prisma client)
  - `npx prisma migrate deploy` (optional; runs migrations on production DB)
  - `npm run build`

Environment variables to add in Vercel (minimum)
- `DATABASE_URL` = `postgres://user:pass@host:5432/dbname` (required in prod)
- `NEXTAUTH_URL` = `https://your-app.vercel.app`
- `NEXTAUTH_SECRET` = `a-very-long-random-string`
- `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app` (optional)
- `APP_URL` = `https://your-app.vercel.app` (optional)
- `EMAIL_WEBHOOK_URL` = `https://...` (optional)

Local verification
```
npm run db:generate
npx prisma migrate dev --name init   # or run migrate deploy against production DB
NEXTAUTH_URL=http://localhost:3001 NEXTAUTH_SECRET=dev-secret npm run build
```

Vercel CLI quick deploy steps
1. Install the Vercel CLI (locally or use `npx`):
   ```bash
   npm i -g vercel
   # or
   npx vercel login
   ```
2. Link the project to your Vercel account / project:
   ```bash
   vercel link
   ```
3. Add environment variables using the CLI (or via Vercel dashboard):
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXT_PUBLIC_APP_URL production
   ```
4. Deploy:
   ```bash
   vercel --prod
   ```

Notes on CLI usage
- Use `vercel env pull .env.local` to download envs to local machine (if you need them locally).
