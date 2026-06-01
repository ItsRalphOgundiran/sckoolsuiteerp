-- P1 operational hardening: payment proof review workflow + result approval/publish lifecycle
-- Columns are already present through earlier migration table redefinitions.

CREATE INDEX IF NOT EXISTS "PaymentProof_status_idx" ON "PaymentProof"("status");
CREATE INDEX IF NOT EXISTS "Result_status_idx" ON "Result"("status");
CREATE INDEX IF NOT EXISTS "Result_term_session_status_idx" ON "Result"("termId", "sessionId", "status");
