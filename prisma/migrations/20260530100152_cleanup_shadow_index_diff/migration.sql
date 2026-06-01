-- RedefineIndex
DROP INDEX IF EXISTS "Result_term_session_status_idx";
CREATE INDEX "Result_termId_sessionId_status_idx" ON "Result"("termId", "sessionId", "status");
