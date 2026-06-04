import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function nuclearPurge() {
  console.log("=== NUCLEAR PURGE - DELETING EVERYTHING ===\n");

  // 1. Delete all data from every table
  console.log("1. Purging all database records...");
  
  // Academic
  await prisma.score.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.onlineClass.deleteMany();
  await prisma.subject.deleteMany();

  // Finance
  await prisma.payment.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.feeItem.deleteMany();
  await prisma.feeProfileItem.deleteMany();
  await prisma.feeProfile.deleteMany();

  // Students/Teachers
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.classArm.deleteMany();
  await prisma.class.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.feeGroup.deleteMany();

  // Academic Calendar
  await prisma.term.deleteMany();
  await prisma.session.deleteMany();

  // Communications
  await prisma.announcement.deleteMany();
  await prisma.parentMessage.deleteMany();
  await prisma.parentComplaint.deleteMany();

  // Reception (if exists)
  try { await (prisma as any).receptionComplaint?.deleteMany(); } catch {}
  try { await (prisma as any).query?.deleteMany(); } catch {}
  try { await (prisma as any).enquiry?.deleteMany(); } catch {}
  try { await (prisma as any).gatePass?.deleteMany(); } catch {}
  try { await (prisma as any).callLog?.deleteMany(); } catch {}
  try { await (prisma as any).correspondence?.deleteMany(); } catch {}
  try { await (prisma as any).visitorLog?.deleteMany(); } catch {}

  // Audit & Config
  await prisma.paymentProof.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invoiceContestAudit.deleteMany();
  await prisma.schoolConfigVersion.deleteMany();
  await prisma.schoolSetting.deleteMany();

  // Users (ALL USERS - NO EXCEPTIONS)
  await prisma.user.deleteMany();

  // Roles
  await prisma.role.deleteMany();

  // School & Branding
  await prisma.schoolBranding.deleteMany();
  await prisma.school.deleteMany();

  console.log("2. All records deleted.\n");

  // 3. Delete the actual SQLite database file
  console.log("3. Deleting database file...");
  
  const possibleDbPaths = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "prisma", "prod.db"),
    path.join(process.cwd(), "dev.db"),
    path.join(process.cwd(), "prod.db"),
  ];

  for (const dbPath of possibleDbPaths) {
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
        console.log(`   Deleted: ${dbPath}`);
      } catch (e) {
        console.log(`   Could not delete: ${dbPath}`);
      }
    }
  }

  // 4. Delete migration journal
  const journalPath = path.join(process.cwd(), "prisma", "dev.db-journal");
  if (fs.existsSync(journalPath)) {
    try {
      fs.unlinkSync(journalPath);
      console.log(`   Deleted journal: ${journalPath}`);
    } catch {}
  }

  console.log("\n=== DATABASE COMPLETELY WIPED ===");
  console.log("\nNext steps:");
  console.log("1. Run: npx prisma migrate dev");
  console.log("2. Run: npm run dev");
  console.log("3. Visit: http://localhost:3000/setup");
  console.log("4. Create your school from scratch");
}

nuclearPurge()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
