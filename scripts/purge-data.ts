import { prisma } from "../src/lib/prisma";

async function purgeData() {
  console.log("Purging all data except Super Admin...\n");

  // Delete in order to respect foreign key constraints
  console.log("Deleting academic records...");
  await prisma.score.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.onlineClass.deleteMany();
  await prisma.subject.deleteMany();

  console.log("Deleting finance records...");
  await prisma.payment.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.feeItem.deleteMany();

  console.log("Deleting student/teacher records...");
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.classArm.deleteMany();
  await prisma.class.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.feeGroup.deleteMany();

  console.log("Deleting academic calendar...");
  await prisma.term.deleteMany();
  await prisma.session.deleteMany();

  console.log("Deleting other records...");
  await prisma.announcement.deleteMany();
  await prisma.parentMessage.deleteMany();
  await prisma.parentComplaint.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.invoiceContestAudit.deleteMany();
  await prisma.schoolConfigVersion.deleteMany();
  await prisma.schoolSetting.deleteMany();

  console.log("Deleting non-super-admin users...");
  await prisma.user.deleteMany({
    where: {
      role: {
        name: { not: "SUPER_ADMIN" }
      }
    }
  });

  console.log("Deleting school and branding...");
  await prisma.schoolBranding.deleteMany();
  await prisma.school.deleteMany();

  // Keep the super admin user but remove school assignment
  console.log("Resetting Super Admin...");
  const superAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@sckoolsuite.com" }
  });

  if (superAdmin) {
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { schoolId: null }
    });
    console.log(`✓ Super Admin (${superAdmin.email}) preserved, school assignment cleared`);
  } else {
    console.log("⚠ Super Admin not found - may need to recreate");
  }

  console.log("\n✓ Purge complete! Only Super Admin remains.");
  console.log("You can now run: npm run dev");
  console.log("Then login with: superadmin@sckoolsuite.com / superadmin123");
}

purgeData()
  .catch((e) => {
    console.error("Error during purge:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
