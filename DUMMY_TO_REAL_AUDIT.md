# DUMMY_TO_REAL_AUDIT

Scope: Admin, Parent, Teacher, Student, Super Admin, Registrar portals.

Legend:
- status: `real` | `partial` | `dummy` | `broken`
- priority: `P0` (must fix now), `P1` (next sprint), `P2` (later)

## Audit Matrix

| Feature / Page | Current Status | Current Data Source | Missing DB Model | Missing API | Missing UI Workflow | Priority | Exact Implementation Plan |
|---|---|---|---|---|---|---|---|
| Super Admin dashboard metrics | partial | Prisma + hardcoded values | None | None | Hardcoded values mixed with real | P0 | Remove hardcoded values and derive all cards from Prisma aggregates only. |
| Super Admin activity/tasks | partial | Mixed static strings + Prisma | None | None | Static cards | P0 | Replace static task/announcement cards with data-derived records. |
| Admin dashboard core KPIs | real | Prisma (`getCoreSchoolDataByContext`, `getAdminOverview`) | None | None | None | P0 | Keep Prisma-only, no seeded fallback text. |
| Admin section pages (students/parents/teachers/classes/subjects/finance/results/lms/attendance) | partial | Prisma + active config JSON | None | None | Some sections are analytics-only views | P1 | Add direct CRUD workflows per section where currently read-only. |
| Admin transport/fleet section | dummy | Static labels in page model | Transport domain models | Transport APIs | Action workflows absent | P1 | Add transport models and CRUD APIs; replace static tiles. |
| Registrar dashboard | partial | Shared role model over generic school data | Admissions/application models | Registrar APIs | Workflow not dedicated | P1 | Add registrar-specific entities (applications/intake/documents) and route handlers. |
| Registrar sidebar pages | dummy | Generic `PortalPage` scaffold | Admissions/application models | Registrar CRUD APIs | All actions are placeholders | P1 | Replace generic pages with real registrar workflows. |
| Parent messages | partial | SchoolSetting JSON blobs (previous) | ParentMessage | Parent message status update API (optional next) | Placeholder lifecycle copy | P0 | Move to first-class `ParentMessage` records; keep parent create/list real, remove placeholder language. |
| Parent complaints | partial | SchoolSetting JSON blobs (previous) | ParentComplaint | Admin complaint status API | Full lifecycle management not present | P0 | Move to `ParentComplaint`; add status lifecycle `OPEN/IN_REVIEW/RESOLVED/CLOSED` and admin status endpoint. |
| Parent payment notice proof | dummy | Text placeholder in form + SchoolSetting JSON metadata | PaymentProof | Multipart proof handling in payment API | File upload missing | P0 | Replace proof text with file upload; persist metadata in `PaymentProof`; store file under `/public/uploads/...`. |
| Parent profile password change panel | dummy | Disabled controls | None | None | Coming-soon button | P0 | Remove non-functional button and show non-action informational state. |
| Parent invoices/receipts | real | Prisma Invoice/Payment/Receipt | None | None | None | P0 | Keep Prisma-only generation and references. |
| Parent result panel | partial | Prisma score/result rows | None | None | Grade display tied to stored score grade | P0 | Compute displayed grades using active grading settings from config engine. |
| Student results page | partial | Prisma score rows | None | None | Grade display tied to stored score grade | P0 | Recompute displayed grade/GPA from active grading config bands. |
| Teacher attendance page | dummy | Read-only attendance listing | None | Teacher attendance write API | Mark attendance action absent | P0 | Add role/school-scoped teacher attendance POST API and embedded write form. |
| Teacher score entry page | dummy | Read-only scores listing | None | Teacher score upsert API | Score submit workflow absent | P0 | Add role/school-scoped teacher score POST API with grading-band computation. |
| Teacher assignments/lessons/timetable | partial | Prisma | None | Some write APIs missing | Mostly read-only | P1 | Add create/update workflows for lesson/assignment/timetable operations. |
| Invoice contest status tracking | partial | SchoolSetting JSON contest record | InvoiceContestAudit | Contest history read support | Immutable timeline not visible | P0 | Add `InvoiceContestAudit` and write history entries for submit/review/approve/reject. |
| Invoice contest parent notification | partial | SchoolSetting pseudo-message (previous) | ParentMessage | None | Not first-class message | P0 | Route status-change notifications through `ParentMessage` table. |
| Cross-school isolation | real | SchoolId filters in most core loaders/routes | None | None | None | P0 | Keep explicit `schoolId` checks in all new APIs and write operations. |
| Role scoping for writes | partial | Existing route auth + role checks | None | Teacher write APIs previously missing | No write forms | P0 | Enforce role + school + ownership checks in each new write endpoint. |
| Audit trail for sensitive actions | partial | No centralized audit for many actions | AuditLog | None | No visible action history | P0 | Add `AuditLog` and write entries for messages, complaints, payment notices, teacher writes, contest transitions. |
| Legacy generic portal component | partial | Prisma + some seeded fallback text | None | None | Fallback seeded values shown | P0 | Remove seeded fallbacks (`2025/2026`, `First Term`) and show real values or `-`. |

## P0 Implementation Execution (This Pass)

Implemented:
- Hardcoded dashboard metrics removed/replaced with Prisma-derived values in super admin surfaces.
- Dashboards kept Prisma-backed with seeded fallback text removed where present.
- Parent messages converted to real table workflow (`ParentMessage`) with audit logging.
- Parent complaints converted to real table workflow (`ParentComplaint`) with lifecycle statuses and admin status API.
- Payment proof placeholder replaced by multipart file upload and `PaymentProof` persistence.
- Invoice contest now writes immutable audit timeline (`InvoiceContestAudit`) and contest status notifications to `ParentMessage`.
- Teacher attendance now writes to database via scoped API + teacher UI form.
- Teacher score entry now upserts to database via scoped API + teacher UI form.
- Student and parent result display now computes grades from active grading settings.
- Added centralized `AuditLog` writes for sensitive operations.

Not fully completed within P0 (remaining):
- Admin UI for complaint lifecycle updates (API is available; UI management panel still pending).
- Full migration from SchoolSetting-based contest storage to first-class normalized contest tables (history is now first-class, record body still in SchoolSetting for compatibility).
- Broader registrar module conversion to domain-specific production workflows.

## Verification Checklist

1. Run migrations and regenerate Prisma client.
2. Sign in as Parent and create message/complaint; verify records are in `ParentMessage`/`ParentComplaint`.
3. Submit payment notice with proof file; verify `Payment`, `PaymentProof`, and `AuditLog` rows.
4. [x] Sign in as Teacher and submit attendance + score; verify `Attendance`/`Score` rows and `AuditLog`.
	- Verified on 2026-05-30 (local): attendance saved from `/teacher/attendance`; score saved from `/teacher/score-entry` with `Grade: B (GPA 4.00)`.
	- DB evidence: `Attendance` id `cmps84q040001xq2hdsxn8the` (`2026-05-30`, `PRESENT`), `Score` id `cmps6np88004lxq8h0q26cslo` (`total=83`, `grade=B`, `gpa=4`), `AuditLog` actions `ATTENDANCE_CREATED` and `SCORE_UPSERTED`.
5. [x] Sign in as Admin/Accountant and review contest; verify `InvoiceContestAudit` timeline.
	- Verified on 2026-05-30 (local): parent submitted contest for invoice `INV-2026-0001`, then admin reviewed via `/api/admin/invoices/contests/review` with action `UNDER_REVIEW`.
	- DB evidence: `InvoiceContestAudit` timeline contains `CONTEST_SUBMITTED` then `CONTEST_UNDER_REVIEW` for invoice id `cmps6np7s003fxq8haudfivb7`.
6. Confirm no cross-school visibility by testing with users from different schools.
