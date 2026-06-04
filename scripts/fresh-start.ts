import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function freshStart() {
  console.log("=== COMPLETE DATABASE WIPE ===\n");

  // Delete everything in proper order (respecting FK constraints)
  console.log("1. Deleting all academic records...");
  await prisma.score.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.onlineClass.deleteMany();
  await prisma.subject.deleteMany();

  console.log("2. Deleting finance records...");
  await prisma.payment.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.feeItem.deleteMany();

  console.log("3. Deleting student/teacher records...");
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.classArm.deleteMany();
  await prisma.class.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.feeGroup.deleteMany();

  console.log("4. Deleting academic calendar...");
  await prisma.term.deleteMany();
  await prisma.session.deleteMany();

  console.log("5. Deleting communications and audit...");
  await prisma.announcement.deleteMany();
  await prisma.parentMessage.deleteMany();
  await prisma.parentComplaint.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invoiceContestAudit.deleteMany();
  await prisma.schoolConfigVersion.deleteMany();
  await prisma.schoolSetting.deleteMany();

  console.log("6. Deleting ALL users...");
  await prisma.user.deleteMany();

  console.log("7. Deleting school and branding...");
  await prisma.schoolBranding.deleteMany();
  await prisma.school.deleteMany();

  console.log("\n=== DATABASE IS NOW EMPTY ===\n");

  // Create fresh admin user (SCHOOL_ADMIN, not SUPER_ADMIN)
  console.log("8. Creating fresh SCHOOL_ADMIN user...");
  
  // First ensure roles exist
  const adminRole = await prisma.role.upsert({
    where: { name: "SCHOOL_ADMIN" },
    update: {},
    create: { name: "SCHOOL_ADMIN" },
  });

  const principalRole = await prisma.role.upsert({
    where: { name: "PRINCIPAL" },
    update: {},
    create: { name: "PRINCIPAL" },
  });

  const teacherRole = await prisma.role.upsert({
    where: { name: "TEACHER" },
    update: {},
    create: { name: "TEACHER" },
  });

  const parentRole = await prisma.role.upsert({
    where: { name: "PARENT" },
    update: {},
    create: { name: "PARENT" },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      name: "School Administrator",
      email: "admin@sckoolsuite.com",
      password: hashedPassword,
      roleId: adminRole.id,
      schoolId: null, // Will be set after school creation
    },
  });

  console.log("\n=== FRESH START COMPLETE ===\n");
  console.log("Admin User Created:");
  console.log("  Email: admin@sckoolsuite.com");
  console.log("  Password: admin123");
  console.log("  Role: SCHOOL_ADMIN");
  console.log("\nNext steps:");
  console.log("1. Run: npm run dev");
  console.log("2. Login with the admin credentials above");
  console.log("3. Complete the 4-step setup wizard");
  console.log("4. School will be linked to this admin automatically");
}

freshStart()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
