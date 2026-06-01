# P1 Approval Workflows Smoke Test

Date: 2026-05-30
Environment: local dev on http://localhost:3000
Dataset: reseeded multi-school fixture (School A: Demo Academy, School B: Pilot College)
Scope: real workflow execution only (no feature changes)

## Rerun Summary

- Initial run identified 4 blockers.
- Rerun after fixes: blocker cases passed.
- Cross-school isolation verified with two real school admins and seeded school-specific proofs/results.

## 1) Admin Payment Proof Review

| Test | Status | Evidence |
|---|---|---|
| Parent uploads payment proof | PASS | `POST /api/parent/payments/notify` returned `200 { ok: true }` (ref `SMOKE-NOTE-1780133778339`). |
| Admin sees proof in queue | PASS | `GET /api/admin/payments/proofs?status=PENDING` contained proof with transaction ref `SMOKE-NOTE-1780133778339`. |
| Admin approves proof | PASS | `POST /api/admin/payments/proofs/{paymentId}/review` with `APPROVE` returned `200`. |
| Invoice/payment/receipt status updates correctly | PASS | Approve response: `paymentStatus=PAID`, invoice updated (`amountPaid=1200`, `balance=82300`, `status=PART_PAYMENT`). |
| Parent sees updated payment/receipt state | PASS | Parent page `/parent/payments` rendered `Confirmed Receipts` state (not `No confirmed receipts yet`). |
| Repeat rejection path with required review note | PASS | `REJECT` without note now returns `400` with `Review note is required when rejecting a payment proof.`; rejection with note succeeds. |

## 2) Admin Result Approval and Publishing

| Test | Status | Evidence |
|---|---|---|
| Teacher enters scores | PASS | `POST /api/teacher/scores` returned `200`, score upserted (`total=83`, `grade=B`, `gpa=4`). |
| Result appears in admin review queue | PASS | `GET /api/admin/results/review?sessionId=...&termId=...` included student row, status `DRAFT`. |
| Admin approves result | PASS | `POST /api/admin/results/review` with `APPROVE` returned `200`, status `APPROVED`. |
| Admin publishes result | PASS | `POST /api/admin/results/review` with `PUBLISH` returned `200`, status `PUBLISHED`. |
| Parent can see published result | PASS | Parent `/parent/results` did not show empty-state string after publish. |
| Student can see published result | PASS | Student `/student/results` did not show unpublished empty-state string after publish. |
| Unpublished/rejected results hidden from parent/student/report pages | PASS | After `REJECT`, parent/student/report views all hid result content. Parent `/parent/results` showed only `No published result is available yet.` with no result card shell. |

## 3) Permission and Scope Checks

| Test | Status | Evidence |
|---|---|---|
| Parent cannot access admin endpoints | PASS | Parent request to `GET /api/admin/payments/proofs` returned `401 Unauthorized`. |
| Student cannot access admin endpoints | PASS | Student request to `GET /api/admin/results/review` returned `401 Unauthorized`. |
| Teacher cannot approve/publish results unless explicitly allowed | PASS | Teacher request to `POST /api/admin/results/review` returned `401 Unauthorized`. |
| Admin cannot see another school's records | PASS | Admin A queue checks did not include School B refs (`adminASeesSchoolBProof=false`, `adminASeesSchoolBResultRow=false`). |
| All queries remain school-scoped | PASS | Cross-school action attempts by Admin A returned safe not-found responses (`404 Payment not found`, `404 Student not found`) for School B IDs. |

## 4) Failure States

| Test | Status | Evidence |
|---|---|---|
| Reject payment without note should fail | PASS | `POST /api/admin/payments/proofs/{paymentId}/review` with `{ action: "REJECT" }` now returns `400` and clear error message. |
| Reject result without note should fail | PASS | `POST /api/admin/results/review` with `{ action: "REJECT" }` now returns `400` and clear error message. |
| Publish unapproved result should fail | PASS | `POST /api/admin/results/review` with `PUBLISH` on `DRAFT` returned `400` with `Result must be approved before publishing`. |
| Invalid payment/result ID should fail safely | PASS | Invalid payment review returned `404 Payment not found`; invalid student for result action returned `404 Student not found`. |

## Bugs Fixed

1. Rejection-note enforcement added for payment proof rejection
- Endpoint: `src/app/api/admin/payments/proofs/[paymentId]/review/route.ts`
- Current behavior: `REJECT` without `reviewNote` returns `400` with clear error.

2. Rejection-note enforcement added for result rejection
- Endpoint: `src/app/api/admin/results/review/route.ts`
- Current behavior: `REJECT` without `reviewNote` returns `400` with clear error.

3. Parent unpublished-result visibility corrected
- File: `src/app/parent/[section]/page.tsx`
- Current behavior: unpublished/rejected/draft states do not render result card shells; empty state is `No published result is available yet.`.

4. Multi-school smoke fixture added for scope validation
- File: `prisma/seed.ts`
- Added School B users and school-scoped payment proof/result records for cross-school access checks.

## Files Changed

- `SMOKE_TEST_P1_APPROVALS.md`
- `src/app/api/admin/payments/proofs/[paymentId]/review/route.ts`
- `src/app/api/admin/results/review/route.ts`
- `src/app/parent/[section]/page.tsx`
- `src/app/parent/_components/parent-results-panel.tsx`
- `prisma/seed.ts`

## Remaining Blockers Before Pilot

None from this P1 smoke-blocker scope.
