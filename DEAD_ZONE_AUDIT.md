# Sckool Suite Dead Zone Audit

Audit date: 2026-05-30

Legend:
- `WORKING` = implemented and operational in current flow.
- `PARTIAL` = implemented but with important workflow gaps.
- `DEAD_ZONE` = UI/menu exists but backend persistence/workflow is missing or non-operational.

| portal/role | page/route | feature/action | UI exists? | API exists? | Database model exists? | Does submit/save work? | Does data reload after save? | Is data school-scoped? | status | priority | fix required |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Admin | `/admin/settings/config-engine` | Publish school configuration version | Yes | Yes (`/api/admin/settings/config`) | Yes (`SchoolConfigVersion`) | Yes | Yes | Yes | WORKING | P1 | None |
| Admin | `/admin/settings/config-engine` | Activate published config version | Yes | Yes (`/api/admin/settings/config/[id]/activate`) | Yes (`SchoolConfigVersion`) | Yes | Yes | Yes | WORKING | P1 | None |
| Admin Finance | `/admin/fees`, `/admin/finance` | Fee group CRUD (create/edit/archive) | Yes | Yes (`/api/admin/finance/fee-groups`) | Yes (`FeeGroup`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | `/admin/fees`, `/admin/finance` | Fee item CRUD (create/edit/archive) | Yes | Yes (`/api/admin/finance/fee-items`) | Yes (`FeeItem`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | `/admin/fees`, `/admin/finance` | Fee item assignment by class/arm/session/term | Yes | Yes | Yes (`classId`, `armId`, `sessionId`, `termId`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | `/admin/fees`, `/admin/finance` | Fee item optional/mandatory + description + due date + sort order | Yes | Yes | Yes (`isOptional`, `description`, `dueDate`, `sortOrder`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | `/admin/[section]` finance action chips | Hide non-connected finance actions | Yes (hidden when non-connected) | N/A | N/A | Yes | N/A | Yes | WORKING | P0 | Keep policy in place for future additions |
| Admin Finance | N/A backend | Activate/deactivate fee items | Yes | Yes (`/api/admin/finance/fee-items/[id]`) | Yes (`FeeItem.isActive`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | N/A backend | Invoice generation from active fee structures | Minimal UI trigger flow | Yes (`/api/admin/invoices/generate`) | Yes (`Invoice`, `InvoiceItem`, `FeeItem`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | N/A backend | Duplicate invoice prevention per student + fee item + session + term | N/A | Yes (fee-item overlap check in generate route) | Yes (`InvoiceItem` + `Invoice` filter) | Yes | Yes | Yes | WORKING | P0 | Add DB-level guard in a future migration if multi-invoice policy changes |
| Admin Finance | `/invoice/[id]` | Invoice fee breakdown grouped by fee group | Yes | Yes | Yes (`FeeGroup`, `FeeItem`) | Yes | Yes | Yes | WORKING | P0 | None |
| Parent | `/parent/[section]` invoice hub | Parent sees breakdown + balance + status | Yes | Yes | Yes | Yes | Yes | Yes | WORKING | P0 | None |
| Parent | `/parent/[section]` invoice hub | Parent payment notice submission | Yes | Yes (`/api/parent/payments/notify`) | Yes (`Payment`, `PaymentProof`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Finance | Approval workflow | Review payment proof approve/reject with required note on reject | Yes | Yes (`/api/admin/payments/proofs/[paymentId]/review`) | Yes | Yes | Yes | Yes | WORKING | P0 | None |
| Finance | `/receipt/[id]` | Receipt linked breakdown by invoice fee groups/items | Yes | Server-side fetch | Yes (`Receipt`, `Invoice`, `FeeItem`, `FeeGroup`) | Yes | Yes | Yes | WORKING | P0 | None |
| Admin Academic | `/admin/settings/config-engine` | Sessions/terms/class/subject authoring | Yes | Yes (config publish) | Yes | Yes | Yes | Yes | WORKING | P1 | None |
| Admin Academic | Result review flow | Approve/publish/reject result with reject note requirement | Yes | Yes (`/api/admin/results/review`) | Yes (`Result`) | Yes | Yes | Yes | WORKING | P0 | None |
| Parent | `/parent/[section]` | Published result visibility only | Yes | Yes | Yes | Yes | Yes | Yes | WORKING | P0 | None |
| Admin | `/admin/settings/branding` | School branding update | Yes | Yes (`/api/admin/branding`) | Yes (`SchoolBranding`) | Yes | Yes | Yes | WORKING | P1 | None |
| Admin | `/admin/[section]` | Registrar/super-admin/transport/messages dashboard section cards | Yes | Mostly no dedicated APIs in admin scope | Partial | Mostly no-op navigation cards | N/A | N/A | DEAD_ZONE | P1 | Implement real feature routes or hide non-functional action chips |
| Teacher | `/teacher/[section]` | Teacher operational workflows (assignment/attendance/score end-to-end) | Yes | Partial | Yes | Partial | Partial | Yes | PARTIAL | P1 | Add missing write APIs and e2e checks for full teacher loop |
| Student | `/student/[section]` | Student learning/records self-service loop | Yes | Partial | Yes | Partial | Partial | Yes | PARTIAL | P2 | Complete missing student-facing endpoints |
| Parent | `/parent/[section]` | Complaints/messages full lifecycle | Yes | Partial (`complaints` status API admin-side exists) | Yes/Partial | Partial | Partial | Yes | PARTIAL | P1 | Add parent create/list/update APIs and portal feedback loop |
| Notifications | `/api/notifications/latest` + portal surfaces | Notification controls and latest feed | Yes | Yes | Yes | Yes | Yes | Yes | WORKING | P2 | Add scenario coverage tests |

## Highest-Priority Dead Zone Fixed

### Fee Groups / Fee Structure (P0)

Root cause:
- Finance setup was previously split across demo cards and config JSON, with no first-class fee-group and fee-item CRUD flow.
- Several visible finance actions were not connected to persistence endpoints.

Fix implemented:
- Added first-class `FeeGroup` model with school-scoped uniqueness (`schoolId + name`, `schoolId + code`).
- Expanded `FeeItem` with `feeGroupId`, `sessionId`, `termId`, optional `armId`, `description`, `isOptional`, `dueDate`, `sortOrder`, and school-scoped `dedupeKey` uniqueness.
- Added admin finance CRUD APIs for fee groups and fee items with archive behavior.
- Replaced non-connected finance action chips with working finance manager workflows in `/admin/fees` and `/admin/finance`.
- Updated invoice generation to use active fee groups/items with class/session/term filtering and optional-fee controls.
- Added per-fee-item duplicate billing protection for the same student/session/term.
- Updated invoice, parent invoice hub, and receipt pages to show grouped fee breakdown from live fee groups.

Operational outcome:
- Fee group and fee item setup now persist through dedicated finance workflows, not config JSON only.
- Finance setup updates are immediately reflected in invoice generation and parent/receipt breakdown views.
- Visible finance actions in admin section are now connected or hidden.

## Remaining P1/P2 Work for Full Finance Completeness

- Add arm assignment to student profile to allow arm-specific fee auto-targeting during invoice generation (currently arm-scoped items are available but student arm linkage is not modeled).
- Add dedicated admin invoice-generation UI for selecting optional fee items per billing run.
- Add DB-level uniqueness guard if enforcing one-invoice-per-student-per-session/term is required as a strict policy.