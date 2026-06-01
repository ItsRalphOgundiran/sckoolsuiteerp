/*
  Warnings:

  - Added the required column `dedupeKey` to the `FeeItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeGroupId` to the `FeeItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `FeeItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termId` to the `FeeItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FeeItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ClassArm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassArm_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassArm_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeGroup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "feeGroupId" TEXT NOT NULL,
    "classId" TEXT,
    "armId" TEXT,
    "sessionId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeItem_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeItem_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "FeeGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeItem_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FeeItem_armId_fkey" FOREIGN KEY ("armId") REFERENCES "ClassArm" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FeeItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeItem_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FeeItem" ("amount", "category", "classId", "createdAt", "id", "isActive", "name", "schoolId") SELECT "amount", "category", "classId", "createdAt", "id", "isActive", "name", "schoolId" FROM "FeeItem";
DROP TABLE "FeeItem";
ALTER TABLE "new_FeeItem" RENAME TO "FeeItem";
CREATE INDEX "FeeItem_schoolId_isActive_idx" ON "FeeItem"("schoolId", "isActive");
CREATE INDEX "FeeItem_schoolId_sessionId_termId_idx" ON "FeeItem"("schoolId", "sessionId", "termId");
CREATE UNIQUE INDEX "FeeItem_schoolId_dedupeKey_key" ON "FeeItem"("schoolId", "dedupeKey");
CREATE TABLE "new_PaymentProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "bankName" TEXT,
    "transactionReference" TEXT NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "proofUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentProof_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentProof_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentProof_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PaymentProof" ("bankName", "createdAt", "id", "paymentDate", "paymentId", "proofUrl", "reviewNote", "reviewedAt", "reviewedById", "schoolId", "status", "transactionReference", "updatedAt") SELECT "bankName", "createdAt", "id", "paymentDate", "paymentId", "proofUrl", "reviewNote", "reviewedAt", "reviewedById", "schoolId", "status", "transactionReference", "updatedAt" FROM "PaymentProof";
DROP TABLE "PaymentProof";
ALTER TABLE "new_PaymentProof" RENAME TO "PaymentProof";
CREATE UNIQUE INDEX "PaymentProof_paymentId_key" ON "PaymentProof"("paymentId");
CREATE TABLE "new_Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cumulativeTotal" REAL NOT NULL,
    "average" REAL NOT NULL,
    "termPercentage" REAL NOT NULL,
    "termGrade" TEXT NOT NULL,
    "termGpa" REAL NOT NULL,
    "classTeacherComment" TEXT,
    "principalComment" TEXT,
    "attendancePresent" INTEGER NOT NULL DEFAULT 0,
    "attendanceTotal" INTEGER NOT NULL DEFAULT 0,
    "cognitiveAssessment" TEXT,
    "affectiveAssessment" TEXT,
    "psychomotorAssessment" TEXT,
    "nextTermResumption" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reviewNote" TEXT,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "publishedById" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Result_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Result_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Result_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Result_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Result_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Result" ("affectiveAssessment", "approvedAt", "approvedById", "attendancePresent", "attendanceTotal", "average", "classTeacherComment", "cognitiveAssessment", "createdAt", "cumulativeTotal", "id", "nextTermResumption", "principalComment", "psychomotorAssessment", "publishedAt", "publishedById", "reviewNote", "schoolId", "sessionId", "status", "studentId", "termGpa", "termGrade", "termId", "termPercentage") SELECT "affectiveAssessment", "approvedAt", "approvedById", "attendancePresent", "attendanceTotal", "average", "classTeacherComment", "cognitiveAssessment", "createdAt", "cumulativeTotal", "id", "nextTermResumption", "principalComment", "psychomotorAssessment", "publishedAt", "publishedById", "reviewNote", "schoolId", "sessionId", "status", "studentId", "termGpa", "termGrade", "termId", "termPercentage" FROM "Result";
DROP TABLE "Result";
ALTER TABLE "new_Result" RENAME TO "Result";
CREATE UNIQUE INDEX "Result_studentId_termId_sessionId_key" ON "Result"("studentId", "termId", "sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ClassArm_schoolId_classId_name_key" ON "ClassArm"("schoolId", "classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FeeGroup_schoolId_name_key" ON "FeeGroup"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FeeGroup_schoolId_code_key" ON "FeeGroup"("schoolId", "code");
