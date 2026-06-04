-- CreateTable
CREATE TABLE "FeeComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeComponent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "feeGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "dueDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeProfile_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "FeeGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeProfile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeProfile_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeProfileItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feeProfileId" TEXT NOT NULL,
    "feeComponentId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeProfileItem_feeProfileId_fkey" FOREIGN KEY ("feeProfileId") REFERENCES "FeeProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeProfileItem_feeComponentId_fkey" FOREIGN KEY ("feeComponentId") REFERENCES "FeeComponent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeProfileClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feeProfileId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeeProfileClass_feeProfileId_fkey" FOREIGN KEY ("feeProfileId") REFERENCES "FeeProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeProfileClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeProfileArm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feeProfileId" TEXT NOT NULL,
    "armId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeeProfileArm_feeProfileId_fkey" FOREIGN KEY ("feeProfileId") REFERENCES "FeeProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeeProfileArm_armId_fkey" FOREIGN KEY ("armId") REFERENCES "ClassArm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "enquiryNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "followUpDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enquiry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GatePass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "passNumber" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "personType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "destination" TEXT,
    "exitTime" DATETIME NOT NULL,
    "expectedReturn" DATETIME,
    "actualReturn" DATETIME,
    "issuedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GatePass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GatePass_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceptionComplaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "complainantName" TEXT NOT NULL,
    "complainantType" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "complaintType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReceptionComplaint_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReceptionComplaint_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "callNumber" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "recipient" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CallLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Correspondence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "refNumber" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "receivedDate" DATETIME,
    "dispatchedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Correspondence_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "queryNumber" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "querierName" TEXT NOT NULL,
    "querierContact" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedById" TEXT,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Query_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Query_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FeeComponent_schoolId_isActive_idx" ON "FeeComponent"("schoolId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FeeComponent_schoolId_name_key" ON "FeeComponent"("schoolId", "name");

-- CreateIndex
CREATE INDEX "FeeProfile_schoolId_feeGroupId_idx" ON "FeeProfile"("schoolId", "feeGroupId");

-- CreateIndex
CREATE INDEX "FeeProfile_schoolId_sessionId_termId_idx" ON "FeeProfile"("schoolId", "sessionId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeProfileItem_feeProfileId_feeComponentId_key" ON "FeeProfileItem"("feeProfileId", "feeComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeProfileClass_feeProfileId_classId_key" ON "FeeProfileClass"("feeProfileId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeProfileArm_feeProfileId_armId_key" ON "FeeProfileArm"("feeProfileId", "armId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_enquiryNumber_key" ON "Enquiry"("enquiryNumber");

-- CreateIndex
CREATE INDEX "Enquiry_schoolId_idx" ON "Enquiry"("schoolId");

-- CreateIndex
CREATE INDEX "Enquiry_stage_idx" ON "Enquiry"("stage");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GatePass_passNumber_key" ON "GatePass"("passNumber");

-- CreateIndex
CREATE INDEX "GatePass_schoolId_idx" ON "GatePass"("schoolId");

-- CreateIndex
CREATE INDEX "GatePass_status_idx" ON "GatePass"("status");

-- CreateIndex
CREATE INDEX "GatePass_createdAt_idx" ON "GatePass"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReceptionComplaint_complaintNumber_key" ON "ReceptionComplaint"("complaintNumber");

-- CreateIndex
CREATE INDEX "ReceptionComplaint_schoolId_idx" ON "ReceptionComplaint"("schoolId");

-- CreateIndex
CREATE INDEX "ReceptionComplaint_status_idx" ON "ReceptionComplaint"("status");

-- CreateIndex
CREATE INDEX "ReceptionComplaint_createdAt_idx" ON "ReceptionComplaint"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CallLog_callNumber_key" ON "CallLog"("callNumber");

-- CreateIndex
CREATE INDEX "CallLog_schoolId_idx" ON "CallLog"("schoolId");

-- CreateIndex
CREATE INDEX "CallLog_createdAt_idx" ON "CallLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Correspondence_refNumber_key" ON "Correspondence"("refNumber");

-- CreateIndex
CREATE INDEX "Correspondence_schoolId_idx" ON "Correspondence"("schoolId");

-- CreateIndex
CREATE INDEX "Correspondence_status_idx" ON "Correspondence"("status");

-- CreateIndex
CREATE INDEX "Correspondence_createdAt_idx" ON "Correspondence"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Query_queryNumber_key" ON "Query"("queryNumber");

-- CreateIndex
CREATE INDEX "Query_schoolId_idx" ON "Query"("schoolId");

-- CreateIndex
CREATE INDEX "Query_status_idx" ON "Query"("status");

-- CreateIndex
CREATE INDEX "Query_createdAt_idx" ON "Query"("createdAt");
