# Sckool Suite MVP

Nigerian-first School ERP + LMS demo built with:

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI components
- Prisma + SQLite
- NextAuth/Auth.js credentials auth
- Zod + React Hook Form
- Lucide icons

## Core MVP Coverage

- Multi-role login: SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, ACCOUNTANT, TEACHER, PARENT, STUDENT
- Super Admin portal: school management, active schools, usage, subscription/revenue placeholders
- School Admin portal: students, parents, teachers, classes, subjects, fees, invoices, payments, results, LMS, attendance, announcements, settings, branding
- Teacher portal: classes/subjects, attendance, scores, LMS, comments, result preview
- Accountant portal: fees, invoices, payments, debtors and outstanding balances
- Parent portal: children, fees/receipts, report card, attendance, LMS and announcements
- Student portal: LMS, assignments, attendance, results/report card
- Printable A4 pages:
	- Invoice: /invoice/[id]
	- Receipt: /receipt/[id]
	- Report card: /reports/[studentId]
- School branding settings page:
	- /admin/settings/branding
	- school profile + colors + themes + bank details + signature/stamp placeholders

App branding is separated from school branding. "Powered by Sckool Suite" is shown discreetly on login and print artifacts.

## Demo Credentials

- superadmin@sckoolsuite.com / password123
- admin@sckoolsuite.com / password123
- principal@sckoolsuite.com / password123
- accountant@sckoolsuite.com / password123
- teacher@sckoolsuite.com / password123
- parent@sckoolsuite.com / password123
- student@sckoolsuite.com / password123

## Seeded Demo Data

- School: Sckool Suite Demo Academy
- Student: Eric Osamudiamen (Year 2, Male, Age 6, Sport House Teak)
- Parent: Mrs. Osamudiamen
- Teacher: Deborah Alabi
- Accountant: Gloria David
- Session/Term: 2025/2026, First Term
- Fees total: NGN 103,000 (part payment NGN 72,100, balance NGN 30,900)
- Scores seeded for 15 subjects with CA + Exam, grade + GPA computed

## Project Setup Commands

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run db:generate
```

Run migration:

```bash
npm run db:migrate
```

Run seed:

```bash
npm run db:seed
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Key Routes

- /login
- /super-admin/dashboard
- /admin/dashboard
- /admin/students
- /admin/parents
- /admin/teachers
- /admin/classes
- /admin/subjects
- /admin/fees
- /admin/invoices
- /admin/payments
- /admin/results
- /admin/lms
- /admin/attendance
- /admin/announcements
- /admin/settings
- /admin/settings/branding
- /teacher/dashboard
- /teacher/attendance
- /teacher/scores
- /teacher/lms
- /teacher/comments
- /accountant/dashboard
- /accountant/fees
- /accountant/invoices
- /accountant/payments
- /accountant/debtors
- /parent/dashboard
- /parent/children
- /parent/fees
- /parent/results
- /parent/lms
- /student/dashboard
- /student/lms
- /student/results
- /invoice/[id]
- /receipt/[id]
- /reports/[studentId]
