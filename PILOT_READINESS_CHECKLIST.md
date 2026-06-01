# Pilot Readiness Checklist (P1)

Date: 2026-05-30
Project: Sckool Suite ERP
Scope: Operational hardening for one real-school pilot (no new modules)

## 1) Admin Lifecycle

- [x] Complete school setup wizard
  - Route: `/create-account`
  - Backed by: `src/app/create-account/actions.ts`
- [x] Branding setup
  - Route: `/admin/settings/branding`
  - API: `GET/POST /api/admin/branding`
- [x] Academic session and term setup
  - Route: `/admin/settings/academic-calendar`
  - APIs:
    - `GET/POST /api/admin/academic/sessions`
    - `POST /api/admin/academic/sessions/[id]/status`
    - `POST /api/admin/academic/sessions/[id]/activate`
    - `GET/POST /api/admin/academic/terms`
    - `POST /api/admin/academic/terms/[id]/status`
    - `POST /api/admin/academic/terms/[id]/activate`
- [x] Class, arm, subject setup
  - Route: `/admin/settings/config-engine`
  - API: `GET/POST /api/admin/settings/config`
- [x] Grading and CA/exam configuration
  - Route: `/admin/settings/config-engine`
  - Uses active config grading bands and assessment types
- [x] Fee structure setup
  - Route: `/admin/settings/config-engine`
  - Config section: `finance.feeStructures`
- [x] Student registration
  - Available through existing data creation workflow (seed + linked user/student records)
- [x] Parent linking
  - Active linkage via `Student.parentId` and parent portal fetches
- [x] Teacher assignment
  - Active linkage via `Subject.teacherId`, `Class.teacherId`, `Student.teacherId`

## 2) Finance Lifecycle

- [x] Generate invoice from fee structure
  - New API: `POST /api/admin/invoices/generate`
- [x] Parent uploads payment proof
  - API: `POST /api/parent/payments/notify`
  - Includes multipart proof upload + metadata
- [x] Admin reviews payment proof
  - New APIs:
    - `GET /api/admin/payments/proofs`
    - `POST /api/admin/payments/proofs/[paymentId]/review`
  - Admin UI wired in:
    - `src/app/admin/[section]/page.tsx` (`payments` / `finance`)
- [x] Approved payment generates receipt
  - Implemented in `POST /api/admin/payments/proofs/[paymentId]/review` (`APPROVE`)
  - Auto-updates invoice totals and status; creates/updates receipt
- [x] Rejected payment notifies parent
  - Implemented in `POST /api/admin/payments/proofs/[paymentId]/review` (`REJECT`)
  - Creates parent message notification

## 3) Academics Lifecycle

- [x] Teacher enters attendance
  - API: `POST /api/teacher/attendance`
- [x] Teacher enters CA/exam scores
  - API: `POST /api/teacher/scores`
- [x] Result computes from active grading config
  - New API: `POST /api/admin/results/review` with `action=APPROVE`
  - Uses active grading bands from config
- [x] Admin/principal approves result before publishing
  - New API: `POST /api/admin/results/review` with `action=APPROVE` then `action=PUBLISH`
- [x] Parent/student/report pages only show published result
  - Enforced by filtering `Result.status = PUBLISHED` in:
    - `src/app/parent/[section]/page.tsx`
    - `src/app/parent/children/[childId]/page.tsx`
    - `src/app/student/[section]/page.tsx`
    - `src/app/reports/[studentId]/page.tsx`

## Admin UI Hardening Addendum

- [x] Payment proof review from admin UI (approve/reject + note handling)
- [x] Result approval from admin UI (approve/return with required rejection note)
- [x] Result publishing from admin UI (publish allowed only from approved)

## 4) Reports Hardening

- [x] Removed remaining template assumptions for report publication path
- [x] Report uses school branding/config for header and grading key
- [x] Report includes promotion status and fee balance
- [x] Report uses neutral wording when signature/stamp are missing
- [x] Receipt neutralized missing signature/stamp wording (no dummy placeholders)

## 5) Data Model & Migration Hardening

- [x] Added `PaymentProofStatus` enum and review fields (`status`, `reviewNote`, `reviewedById`, `reviewedAt`)
- [x] Added `ResultStatus` enum and approval/publication fields (`status`, `reviewNote`, `approvedById`, `approvedAt`, `publishedById`, `publishedAt`)
- [x] Added migration: `20260530121500_p1_operational_hardening`
- [x] Neutralized out-of-order migration (`20260530085519_p1_operational_hardening`) to no-op for clean fresh-db deploys

## 6) Executed Quality Gates

- [x] TypeScript check
  - Command: `npx tsc --noEmit`
- [x] ESLint (actionable project scope)
  - Command: `npx eslint .`
- [x] Production build
  - Command: `npm run build`
- [x] Migration against fresh database
  - Command: `DATABASE_URL='file:./pilot-test.db' npx prisma migrate deploy`
- [x] Seed test against fresh database
  - Command: `DATABASE_URL='file:./pilot-test.db' npx prisma db seed`

## 7) Test Credentials (Seed)

Password for all users: `password123`

- Super Admin: `superadmin@sckoolsuite.com`
- School Admin: `admin@sckoolsuite.com`
- Principal: `principal@sckoolsuite.com`
- Accountant: `accountant@sckoolsuite.com`
- Teacher: `teacher@sckoolsuite.com`
- Parent: `parent@sckoolsuite.com`
- Student: `student@sckoolsuite.com`

## 8) Test Routes

- Login: `/login`
- Create School Account: `/create-account`
- Admin Dashboard: `/admin/dashboard`
- Admin Results: `/admin/results`
- Admin Finance/Payments: `/admin/payments`
- Admin Settings (Config Engine): `/admin/settings/config-engine`
- Parent Dashboard: `/parent/dashboard`
- Parent Fees: `/parent/fees`
- Parent Results: `/parent/results`
- Parent Messages: `/parent/messages`
- Teacher Dashboard: `/teacher/dashboard`
- Teacher Attendance: `/teacher/attendance`
- Teacher Results Entry: `/teacher/results`
- Student Dashboard: `/student/dashboard`
- Student Results: `/student/results`

## 9) Pilot Go/No-Go Summary

- [x] GO for one-school pilot on core admin/finance/academics/report lifecycle
- [ ] Deferred for later phase: richer UI workflow orchestration for student registration and assignment management screens (core data links and APIs already operational)
