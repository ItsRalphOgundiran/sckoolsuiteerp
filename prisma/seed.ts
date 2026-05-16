import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const gradeScale = [
  { min: 95, grade: "A+", gpa: 5 },
  { min: 90, grade: "A", gpa: 4.5 },
  { min: 80, grade: "B+", gpa: 4 },
  { min: 70, grade: "B", gpa: 3 },
  { min: 60, grade: "C+", gpa: 2.5 },
  { min: 55, grade: "C", gpa: 2 },
  { min: 50, grade: "C-", gpa: 1.5 },
  { min: 45, grade: "D", gpa: 1 },
  { min: 40, grade: "E", gpa: 0.5 },
  { min: 0, grade: "U", gpa: 0 },
];

function getGrade(total: number) {
  return gradeScale.find((rule) => total >= rule.min) ?? gradeScale[gradeScale.length - 1];
}

async function upsertRole(name: RoleType) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function main() {
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.score.deleteMany();
  await prisma.result.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.schoolSetting.deleteMany();
  await prisma.feeItem.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.term.deleteMany();
  await prisma.session.deleteMany();
  await prisma.schoolBranding.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const roles = {
    SUPER_ADMIN: await upsertRole(RoleType.SUPER_ADMIN),
    SCHOOL_ADMIN: await upsertRole(RoleType.SCHOOL_ADMIN),
    PRINCIPAL: await upsertRole(RoleType.PRINCIPAL),
    ACCOUNTANT: await upsertRole(RoleType.ACCOUNTANT),
    TEACHER: await upsertRole(RoleType.TEACHER),
    PARENT: await upsertRole(RoleType.PARENT),
    STUDENT: await upsertRole(RoleType.STUDENT),
  };

  const password = await bcrypt.hash("password123", 10);

  const school = await prisma.school.create({
    data: {
      name: "Sckool Suite Demo Academy",
      email: "hello@demoacademy.ng",
      phone: "+234 803 000 0000",
      address: "15 Admiralty Way, Lekki Phase 1, Lagos",
      website: "https://demoacademy.ng",
      motto: "Building Future Leaders",
    },
  });

  await prisma.schoolBranding.create({
    data: {
      schoolId: school.id,
      primaryColor: "#0B1F4D",
      secondaryColor: "#0E9F6E",
      reportCardTheme: "premium-classic",
      invoiceTheme: "premium-clean",
      receiptTheme: "premium-minimal",
      bankName: "ZENITH BANK",
      bankAccountName: "Parach Schools",
      bankAccountNumber: "1221809249",
      bankInstructions:
        "1. At least 70% of fees is required on resumption. 2. ICT and clubs fees are due on or before resumption. 3. Tuition and other fees are payable by cheque, bankdraft, or third-party transfer to the school account. 4. The school may exclude students without notice if fees are not paid. 5. Fees are not pro-rated regardless of resumption date.",
      principalSignature: "Principal Signature Placeholder",
      teacherSignature: "Class Teacher Signature Placeholder",
      schoolStamp: "School Stamp Placeholder",
      reportHeaderText: "Knowledge. Character. Excellence.",
      receiptFooterText: "Thank you for paying promptly.",
    },
  });

  const currentSession = await prisma.session.create({
    data: {
      schoolId: school.id,
      name: "2025/2026",
      isCurrent: true,
    },
  });

  const currentTerm = await prisma.term.create({
    data: {
      schoolId: school.id,
      sessionId: currentSession.id,
      name: "First Term",
      isCurrent: true,
    },
  });

  await prisma.term.createMany({
    data: [
      {
        schoolId: school.id,
        sessionId: currentSession.id,
        name: "Second Term",
      },
      {
        schoolId: school.id,
        sessionId: currentSession.id,
        name: "Third Term",
      },
    ],
  });

  await prisma.session.create({
    data: {
      schoolId: school.id,
      name: "2026/2027",
      terms: {
        create: [
          { schoolId: school.id, name: "First Term" },
          { schoolId: school.id, name: "Second Term" },
          { schoolId: school.id, name: "Third Term" },
        ],
      },
    },
  });

  const year2 = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: "Year 2",
      classTeacher: "Deborah Alabi",
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      roleId: roles.SUPER_ADMIN.id,
      name: "Platform Super Admin",
      email: "superadmin@sckoolsuite.com",
      password,
    },
  });

  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      roleId: roles.SCHOOL_ADMIN.id,
      name: "Grace Afolabi",
      email: "admin@sckoolsuite.com",
      password,
    },
  });

  const principal = await prisma.user.create({
    data: {
      schoolId: school.id,
      roleId: roles.PRINCIPAL.id,
      name: "Mrs. Ireti Balogun",
      email: "principal@sckoolsuite.com",
      password,
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      roleId: roles.ACCOUNTANT.id,
      name: "Gloria David",
      email: "accountant@sckoolsuite.com",
      password,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      roleId: roles.TEACHER.id,
      name: "Deborah Alabi",
      email: "teacher@sckoolsuite.com",
      password,
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      roleId: roles.PARENT.id,
      name: "Mrs. Osamudiamen",
      email: "parent@sckoolsuite.com",
      password,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      schoolId: school.id,
      roleId: roles.STUDENT.id,
      name: "Eric Osamudiamen",
      email: "student@sckoolsuite.com",
      password,
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      schoolId: school.id,
      userId: teacherUser.id,
    },
  });

  const parent = await prisma.parent.create({
    data: {
      schoolId: school.id,
      userId: parentUser.id,
    },
  });

  await prisma.class.update({ where: { id: year2.id }, data: { teacherId: teacher.id } });

  const student = await prisma.student.create({
    data: {
      schoolId: school.id,
      userId: studentUser.id,
      parentId: parent.id,
      teacherId: teacher.id,
      classId: year2.id,
      gender: "Male",
      age: 6,
      sportHouse: "Teak",
      coCurricular: "Music Club",
      responsibilities: "Library Assistant",
    },
  });

  const subjects = [
    "Numeracy",
    "Quantitative Reasoning",
    "Literacy",
    "Verbal Reasoning",
    "Science",
    "Citizenship",
    "Geography",
    "History",
    "Religious Education",
    "ICT",
    "CCA",
    "Music",
    "Diction",
    "Yoruba",
    "Etiquette",
  ];

  const subjectMap = new Map<string, string>();
  for (const subjectName of subjects) {
    const subject = await prisma.subject.create({
      data: {
        schoolId: school.id,
        classId: year2.id,
        teacherId: teacher.id,
        name: subjectName,
      },
    });
    subjectMap.set(subjectName, subject.id);
  }

  const fees = [
    { category: "Core", name: "Tuition", amount: 45000, selectedByDefault: true },
    { category: "Core", name: "Stationery & Utility", amount: 7500, selectedByDefault: true },
    { category: "Core", name: "Examination", amount: 4000, selectedByDefault: true },
    { category: "Core", name: "PTF", amount: 1500, selectedByDefault: true },
    { category: "Core", name: "Music", amount: 1500, selectedByDefault: true },
    { category: "Core", name: "ICT", amount: 1500, selectedByDefault: true },
    { category: "Core", name: "Chess", amount: 2500, selectedByDefault: true },
    { category: "Core", name: "Etiquette", amount: 2000, selectedByDefault: true },
    { category: "Core", name: "Diction and Elocution", amount: 1500, selectedByDefault: true },
    { category: "Core", name: "Creative Arts", amount: 1000, selectedByDefault: true },
    { category: "Core", name: "Medical", amount: 1000, selectedByDefault: true },
    { category: "Core", name: "Excursion", amount: 12000, selectedByDefault: true },
    { category: "Core", name: "Activity Week", amount: 2000, selectedByDefault: true },
    { category: "Core", name: "First School Leaving Certificate (FSLC)", amount: 12500, selectedByDefault: true },
    { category: "Optional", name: "Lunch", amount: 0, selectedByDefault: false },
    { category: "Optional", name: "After School Care/Lesson", amount: 0, selectedByDefault: false },
    { category: "Optional", name: "Taekwondo", amount: 0, selectedByDefault: false },
    { category: "Optional", name: "School Bus", amount: 0, selectedByDefault: false },
    { category: "Optional", name: "Football Academy", amount: 0, selectedByDefault: false },
    { category: "Optional", name: "Ballet", amount: 7500, selectedByDefault: true },
    { category: "Optional", name: "Textbooks", amount: 0, selectedByDefault: false },
  ];

  const feeItems = [] as { id: string; name: string; amount: number; selectedByDefault: boolean }[];
  for (const fee of fees) {
    const item = await prisma.feeItem.create({
      data: {
        schoolId: school.id,
        classId: year2.id,
        category: fee.category,
        name: fee.name,
        amount: fee.amount,
      },
    });
    feeItems.push({ id: item.id, name: item.name, amount: item.amount, selectedByDefault: fee.selectedByDefault });
  }

  const billedFeeItems = feeItems.filter((item) => item.selectedByDefault);
  const totalAmount = billedFeeItems.reduce((sum, item) => sum + item.amount, 0);
  const amountPaid = 72100;
  const balance = totalAmount - amountPaid;

  const invoice = await prisma.invoice.create({
    data: {
      schoolId: school.id,
      studentId: student.id,
      parentId: parent.id,
      classId: year2.id,
      termId: currentTerm.id,
      sessionId: currentSession.id,
      invoiceNumber: "INV-2026-0001",
      totalAmount,
      amountPaid,
      balance,
      status: "PART_PAYMENT",
      paymentInstructions:
        "At least 70% of total fees is required on resumption. ICT and clubs fees are due on or before resumption. Use cheque, bankdraft, or transfer to ZENITH BANK 1221809249 (Parach Schools).",
      createdById: accountantUser.id,
      dueDate: new Date("2026-01-31"),
      items: {
        create: billedFeeItems.map((item) => ({ feeItemId: item.id, amount: item.amount })),
      },
    },
  });

  await prisma.payment.create({
    data: {
      schoolId: school.id,
      invoiceId: invoice.id,
      studentId: student.id,
      method: "Manual Bank Transfer",
      amount: amountPaid,
      status: "PENDING",
      confirmedAt: new Date(),
      receivedById: accountantUser.id,
    },
  });

  await prisma.receipt.create({
    data: {
      schoolId: school.id,
      invoiceId: invoice.id,
      studentId: student.id,
      parentId: parent.id,
      receiptNumber: "RCP-2026-0001",
      amount: amountPaid,
      balance,
      paymentMethod: "Bank Transfer",
      paymentDate: new Date("2026-01-20"),
      receivedBy: "Gloria David",
    },
  });

  const scoreData = [
    ["Numeracy", 19, 30],
    ["Quantitative Reasoning", 8, 15],
    ["Literacy", 30, 20],
    ["Verbal Reasoning", 32, 45],
    ["Science", 32, 40.5],
    ["Citizenship", 31, 31],
    ["Geography", 23, 32],
    ["History", 26, 31.5],
    ["Religious Education", 25, 49],
    ["ICT", 24, 20],
    ["CCA", 35, 44],
    ["Music", 32, 30],
    ["Diction", 40, 54],
    ["Yoruba", 8, 26],
    ["Etiquette", 20, 30],
  ] as const;

  let cumulativeTotal = 0;
  let cumulativeGpa = 0;

  for (const [subjectName, caScore, examScore] of scoreData) {
    const total = caScore + examScore;
    const { grade, gpa } = getGrade(total);
    cumulativeTotal += total;
    cumulativeGpa += gpa;

    await prisma.score.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        subjectId: subjectMap.get(subjectName)!,
        teacherId: teacher.id,
        termId: currentTerm.id,
        sessionId: currentSession.id,
        caScore,
        examScore,
        total,
        grade,
        gpa,
      },
    });
  }

  const average = cumulativeTotal / scoreData.length;
  const termGpa = cumulativeGpa / scoreData.length;
  const gradeMeta = getGrade(average);

  await prisma.result.create({
    data: {
      schoolId: school.id,
      studentId: student.id,
      termId: currentTerm.id,
      sessionId: currentSession.id,
      cumulativeTotal,
      average,
      termPercentage: average,
      termGrade: gradeMeta.grade,
      termGpa,
      classTeacherComment: "Eric is bright and attentive. Improve consistency in Numeracy drills.",
      principalComment: "Excellent potential. Keep up discipline and steady effort.",
      attendancePresent: 52,
      attendanceTotal: 60,
      cognitiveAssessment: "Curious and analytical",
      affectiveAssessment: "Respectful and cooperative",
      psychomotorAssessment: "Very active and coordinated",
      nextTermResumption: new Date("2026-05-05"),
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        schoolId: school.id,
        classId: year2.id,
        subjectId: subjectMap.get("Science")!,
        teacherId: teacher.id,
        title: "Sources of Water",
        note: "Types of water sources in Nigeria and basic water hygiene.",
      },
      {
        schoolId: school.id,
        classId: year2.id,
        subjectId: subjectMap.get("ICT")!,
        teacherId: teacher.id,
        title: "Parts of a Computer",
        note: "Identify monitor, keyboard, mouse, and CPU with practical examples.",
      },
    ],
  });

  const scienceLesson = await prisma.lesson.findFirstOrThrow({ where: { title: "Sources of Water" } });

  await prisma.assignment.createMany({
    data: [
      {
        schoolId: school.id,
        lessonId: scienceLesson.id,
        classId: year2.id,
        subjectId: subjectMap.get("Science")!,
        teacherId: teacher.id,
        title: "Draw 3 Water Sources",
        instruction: "Draw and label three sources of water found in your community.",
        dueDate: new Date("2026-02-02"),
        studentId: student.id,
      },
      {
        schoolId: school.id,
        classId: year2.id,
        subjectId: subjectMap.get("ICT")!,
        teacherId: teacher.id,
        title: "Computer Parts Worksheet",
        instruction: "Match each computer part to its function.",
        dueDate: new Date("2026-02-05"),
        studentId: student.id,
      },
    ],
  });

  for (let i = 1; i <= 10; i += 1) {
    await prisma.attendance.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        sessionId: currentSession.id,
        termId: currentTerm.id,
        classId: year2.id,
        teacherId: teacher.id,
        date: new Date(`2026-01-${String(i).padStart(2, "0")}`),
        status: i === 4 ? "LATE" : i === 7 ? "ABSENT" : "PRESENT",
      },
    });
  }

  await prisma.announcement.createMany({
    data: [
      {
        schoolId: school.id,
        title: "Inter-house Sports Practice",
        body: "Practice begins every Tuesday and Thursday by 2pm.",
        audience: "ALL",
      },
      {
        schoolId: school.id,
        title: "Mid-term Break",
        body: "School will close from 15th February and resume 22nd February.",
        audience: "PARENT_STUDENT",
      },
    ],
  });

  await prisma.schoolSetting.createMany({
    data: [
      { schoolId: school.id, key: "academic_session", value: "2025/2026" },
      { schoolId: school.id, key: "current_term", value: "First Term" },
      { schoolId: school.id, key: "active_session_id", value: currentSession.id },
      { schoolId: school.id, key: "active_term_id", value: currentTerm.id },
      { schoolId: school.id, key: "invoice_prefix", value: "INV" },
      { schoolId: school.id, key: "receipt_prefix", value: "RCP" },
      { schoolId: school.id, key: "report_theme", value: "premium-classic" },
    ],
  });

  console.log("Seed complete", {
    school: school.name,
    users: {
      superAdmin: superAdmin.email,
      admin: admin.email,
      principal: principal.email,
      accountant: accountantUser.email,
      teacher: teacherUser.email,
      parent: parentUser.email,
      student: studentUser.email,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
