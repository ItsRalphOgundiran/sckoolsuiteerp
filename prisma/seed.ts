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

function buildFeeItemDedupeKey(input: {
  feeGroupId: string;
  name: string;
  classId?: string | null;
  armId?: string | null;
  sessionId: string;
  termId: string;
}) {
  return [
    input.feeGroupId,
    input.name.trim().toLowerCase(),
    input.classId ?? "global",
    input.armId ?? "all-arms",
    input.sessionId,
    input.termId,
  ].join("::");
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
  await prisma.feeGroup.deleteMany();
  await prisma.classArm.deleteMany();
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

  const year2ArmA = await prisma.classArm.create({
    data: {
      schoolId: school.id,
      classId: year2.id,
      name: "A",
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

  const groupByCategory = new Map<string, string>();
  for (const fee of fees) {
    if (groupByCategory.has(fee.category)) continue;
    const created = await prisma.feeGroup.create({
      data: {
        schoolId: school.id,
        name: fee.category,
        code: fee.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "general",
        isActive: true,
      },
    });
    groupByCategory.set(fee.category, created.id);
  }

  const feeItems = [] as { id: string; name: string; amount: number; selectedByDefault: boolean }[];
  for (const fee of fees) {
    const feeGroupId = groupByCategory.get(fee.category);
    if (!feeGroupId) continue;
    const item = await prisma.feeItem.create({
      data: {
        schoolId: school.id,
        feeGroupId,
        sessionId: currentSession.id,
        termId: currentTerm.id,
        classId: year2.id,
        armId: fee.category === "Optional" ? year2ArmA.id : null,
        category: fee.category,
        name: fee.name,
        description: `${fee.category} fee item`,
        amount: fee.amount,
        isOptional: fee.category === "Optional",
        dueDate: new Date("2026-01-31"),
        sortOrder: fees.findIndex((itemFee) => itemFee.name === fee.name),
        dedupeKey: buildFeeItemDedupeKey({
          feeGroupId,
          name: fee.name,
          classId: year2.id,
          armId: fee.category === "Optional" ? year2ArmA.id : null,
          sessionId: currentSession.id,
          termId: currentTerm.id,
        }),
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

  const schoolTwo = await prisma.school.create({
    data: {
      name: "Sckool Suite Pilot College",
      email: "hello@pilotcollege.ng",
      phone: "+234 803 111 1111",
      address: "21 Kingsway Road, Ikeja, Lagos",
      website: "https://pilotcollege.ng",
      motto: "Raising Distinct Scholars",
    },
  });

  await prisma.schoolBranding.create({
    data: {
      schoolId: schoolTwo.id,
      primaryColor: "#1A365D",
      secondaryColor: "#2F855A",
      reportCardTheme: "premium-classic",
      invoiceTheme: "premium-clean",
      receiptTheme: "premium-minimal",
      bankName: "GTBANK",
      bankAccountName: "Pilot College",
      bankAccountNumber: "0028010199",
      bankInstructions: "Pay fees to GTBANK 0028010199 and upload proof for verification.",
      reportHeaderText: "Discipline. Knowledge. Impact.",
      receiptFooterText: "Payment acknowledged.",
    },
  });

  const schoolTwoSession = await prisma.session.create({
    data: {
      schoolId: schoolTwo.id,
      name: "2025/2026",
      isCurrent: true,
    },
  });

  const schoolTwoTerm = await prisma.term.create({
    data: {
      schoolId: schoolTwo.id,
      sessionId: schoolTwoSession.id,
      name: "First Term",
      isCurrent: true,
    },
  });

  const schoolTwoClass = await prisma.class.create({
    data: {
      schoolId: schoolTwo.id,
      name: "Year 3",
      classTeacher: "Idowu Peters",
    },
  });

  const schoolTwoArmA = await prisma.classArm.create({
    data: {
      schoolId: schoolTwo.id,
      classId: schoolTwoClass.id,
      name: "A",
    },
  });

  const schoolTwoAdmin = await prisma.user.create({
    data: {
      schoolId: schoolTwo.id,
      roleId: roles.SCHOOL_ADMIN.id,
      name: "Aisha Bello",
      email: "admin.pilot@sckoolsuite.com",
      password,
    },
  });

  const schoolTwoAccountantUser = await prisma.user.create({
    data: {
      schoolId: schoolTwo.id,
      roleId: roles.ACCOUNTANT.id,
      name: "Kehinde Aina",
      email: "accountant.pilot@sckoolsuite.com",
      password,
    },
  });

  const schoolTwoTeacherUser = await prisma.user.create({
    data: {
      schoolId: schoolTwo.id,
      roleId: roles.TEACHER.id,
      name: "Idowu Peters",
      email: "teacher.pilot@sckoolsuite.com",
      password,
    },
  });

  const schoolTwoParentUser = await prisma.user.create({
    data: {
      schoolId: schoolTwo.id,
      roleId: roles.PARENT.id,
      name: "Chinwe Okafor",
      email: "parent.pilot@sckoolsuite.com",
      password,
    },
  });

  const schoolTwoStudentUser = await prisma.user.create({
    data: {
      schoolId: schoolTwo.id,
      roleId: roles.STUDENT.id,
      name: "Daniel Okafor",
      email: "student.pilot@sckoolsuite.com",
      password,
    },
  });

  const schoolTwoTeacher = await prisma.teacher.create({
    data: {
      schoolId: schoolTwo.id,
      userId: schoolTwoTeacherUser.id,
    },
  });

  const schoolTwoParent = await prisma.parent.create({
    data: {
      schoolId: schoolTwo.id,
      userId: schoolTwoParentUser.id,
    },
  });

  await prisma.class.update({ where: { id: schoolTwoClass.id }, data: { teacherId: schoolTwoTeacher.id } });

  const schoolTwoStudent = await prisma.student.create({
    data: {
      schoolId: schoolTwo.id,
      userId: schoolTwoStudentUser.id,
      parentId: schoolTwoParent.id,
      teacherId: schoolTwoTeacher.id,
      classId: schoolTwoClass.id,
      gender: "Male",
      age: 8,
      sportHouse: "Maple",
      coCurricular: "Coding Club",
      responsibilities: "Class Prefect",
    },
  });

  const schoolTwoSubject = await prisma.subject.create({
    data: {
      schoolId: schoolTwo.id,
      classId: schoolTwoClass.id,
      teacherId: schoolTwoTeacher.id,
      name: "Mathematics",
    },
  });

  const schoolTwoFeeGroup = await prisma.feeGroup.create({
    data: {
      schoolId: schoolTwo.id,
      name: "Core",
      code: "core",
      isActive: true,
    },
  });

  const schoolTwoFeeItem = await prisma.feeItem.create({
    data: {
      schoolId: schoolTwo.id,
      feeGroupId: schoolTwoFeeGroup.id,
      sessionId: schoolTwoSession.id,
      termId: schoolTwoTerm.id,
      classId: schoolTwoClass.id,
      armId: schoolTwoArmA.id,
      category: "Core",
      name: "Tuition",
      description: "Core tuition fee",
      amount: 60000,
      isOptional: false,
      dueDate: new Date("2026-02-10"),
      sortOrder: 0,
      dedupeKey: buildFeeItemDedupeKey({
        feeGroupId: schoolTwoFeeGroup.id,
        name: "Tuition",
        classId: schoolTwoClass.id,
        armId: schoolTwoArmA.id,
        sessionId: schoolTwoSession.id,
        termId: schoolTwoTerm.id,
      }),
    },
  });

  const schoolTwoInvoice = await prisma.invoice.create({
    data: {
      schoolId: schoolTwo.id,
      studentId: schoolTwoStudent.id,
      parentId: schoolTwoParent.id,
      classId: schoolTwoClass.id,
      termId: schoolTwoTerm.id,
      sessionId: schoolTwoSession.id,
      invoiceNumber: "INV-PILOT-0001",
      totalAmount: 60000,
      amountPaid: 0,
      balance: 60000,
      status: "PENDING",
      paymentInstructions: "Pay to GTBANK and upload proof for review.",
      createdById: schoolTwoAccountantUser.id,
      dueDate: new Date("2026-02-10"),
      items: {
        create: [{ feeItemId: schoolTwoFeeItem.id, amount: 60000 }],
      },
    },
  });

  const schoolTwoPayment = await prisma.payment.create({
    data: {
      schoolId: schoolTwo.id,
      invoiceId: schoolTwoInvoice.id,
      studentId: schoolTwoStudent.id,
      method: "Bank Transfer",
      amount: 15000,
      status: "PENDING",
    },
  });

  await prisma.paymentProof.create({
    data: {
      schoolId: schoolTwo.id,
      paymentId: schoolTwoPayment.id,
      bankName: "GTBANK",
      transactionReference: "PILOT-SCOPE-REF-001",
      paymentDate: new Date("2026-01-25"),
      proofUrl: "/uploads/smoke/pilot-proof.pdf",
      status: "PENDING",
    },
  });

  const schoolTwoGrade = getGrade(67);
  await prisma.score.create({
    data: {
      schoolId: schoolTwo.id,
      studentId: schoolTwoStudent.id,
      subjectId: schoolTwoSubject.id,
      teacherId: schoolTwoTeacher.id,
      termId: schoolTwoTerm.id,
      sessionId: schoolTwoSession.id,
      caScore: 27,
      examScore: 40,
      total: 67,
      grade: schoolTwoGrade.grade,
      gpa: schoolTwoGrade.gpa,
    },
  });

  await prisma.result.create({
    data: {
      schoolId: schoolTwo.id,
      studentId: schoolTwoStudent.id,
      termId: schoolTwoTerm.id,
      sessionId: schoolTwoSession.id,
      cumulativeTotal: 67,
      average: 67,
      termPercentage: 67,
      termGrade: schoolTwoGrade.grade,
      termGpa: schoolTwoGrade.gpa,
      classTeacherComment: "Good performance.",
      principalComment: "Keep improving.",
      attendancePresent: 20,
      attendanceTotal: 24,
      status: "DRAFT",
    },
  });

  await prisma.schoolSetting.createMany({
    data: [
      { schoolId: schoolTwo.id, key: "academic_session", value: "2025/2026" },
      { schoolId: schoolTwo.id, key: "current_term", value: "First Term" },
      { schoolId: schoolTwo.id, key: "active_session_id", value: schoolTwoSession.id },
      { schoolId: schoolTwo.id, key: "active_term_id", value: schoolTwoTerm.id },
      { schoolId: schoolTwo.id, key: "invoice_prefix", value: "INV-PILOT" },
      { schoolId: schoolTwo.id, key: "receipt_prefix", value: "RCP-PILOT" },
      { schoolId: schoolTwo.id, key: "report_theme", value: "premium-classic" },
    ],
  });

  console.log("Seed complete", {
    schools: [school.name, schoolTwo.name],
    users: {
      superAdmin: superAdmin.email,
      admin: admin.email,
      principal: principal.email,
      accountant: accountantUser.email,
      teacher: teacherUser.email,
      parent: parentUser.email,
      student: studentUser.email,
      schoolTwoAdmin: schoolTwoAdmin.email,
      schoolTwoAccountant: schoolTwoAccountantUser.email,
      schoolTwoTeacher: schoolTwoTeacherUser.email,
      schoolTwoParent: schoolTwoParentUser.email,
      schoolTwoStudent: schoolTwoStudentUser.email,
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
