import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { getSetupWizardState } from "@/lib/setup-wizard";
import { AcademicCalendarService } from "@/modules/academic-setup/services/academic-calendar.service";

const schema = z.object({
  studentId: z.string().min(5),
  includeOptional: z.boolean().optional().default(false),
  dueDate: z.string().optional(),
  paymentInstructions: z.string().max(1000).optional(),
  termId: z.string().min(5).optional(),
  sessionId: z.string().min(5).optional(),
});

const calendarService = new AcademicCalendarService();

async function nextInvoiceNumber(schoolId: string) {
  const count = await prisma.invoice.count({ where: { schoolId } });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["SCHOOL_ADMIN", "PRINCIPAL", "ACCOUNTANT", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const setup = await getSetupWizardState(session.user.schoolId);
  if (!setup.status.setupCompleted) {
    return NextResponse.json({ error: "Setup wizard must be completed before generating invoices.", setup }, { status: 409 });
  }

  const context = await calendarService.getUserContext(session.user.schoolId, session.user.id);
  const sessionId = parsed.data.sessionId ?? context.sessionId;
  const termId = parsed.data.termId ?? context.termId;

  if (!sessionId || !termId) {
    return NextResponse.json({ error: "Academic context is not selected" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, schoolId: session.user.schoolId },
    include: { class: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const feeItems = await prisma.feeItem.findMany({
    where: {
      schoolId: session.user.schoolId,
      feeGroup: { isActive: true },
      sessionId,
      termId,
      OR: student.classId ? [{ classId: student.classId }, { classId: null }] : [{ classId: null }],
      armId: null,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { feeGroup: true },
  });

  const selectedItems = feeItems.filter((item) => {
    if (item.amount <= 0) return false;
    if (parsed.data.includeOptional) return true;
    return !item.isOptional;
  });

  if (!selectedItems.length) {
    return NextResponse.json({ error: "No active fee items found for invoice generation" }, { status: 400 });
  }

  const existingItemRows = await prisma.invoiceItem.findMany({
    where: {
      feeItemId: { in: selectedItems.map((item) => item.id) },
      invoice: {
        schoolId: session.user.schoolId,
        studentId: student.id,
        sessionId,
        termId,
      },
    },
    select: { feeItemId: true },
  });

  const billedFeeItemIds = new Set(existingItemRows.map((row) => row.feeItemId));
  const netNewItems = selectedItems.filter((item) => !billedFeeItemIds.has(item.id));

  if (!netNewItems.length) {
    return NextResponse.json({ error: "All selected fee items are already billed for this student/session/term." }, { status: 409 });
  }

  const totalAmount = netNewItems.reduce((sum, item) => sum + item.amount, 0);

  const invoice = await prisma.invoice.create({
    data: {
      schoolId: session.user.schoolId,
      studentId: student.id,
      parentId: student.parentId,
      classId: student.classId,
      termId,
      sessionId,
      invoiceNumber: await nextInvoiceNumber(session.user.schoolId),
      totalAmount,
      amountPaid: 0,
      balance: totalAmount,
      status: "UNPAID",
      paymentInstructions: parsed.data.paymentInstructions?.trim() || null,
      createdById: session.user.id,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      items: {
        create: netNewItems.map((item) => ({
          feeItemId: item.id,
          amount: item.amount,
        })),
      },
    },
    include: {
      items: { include: { feeItem: { include: { feeGroup: true } } } },
      term: true,
      session: true,
      student: { include: { user: true } },
    },
  });

  await createAuditLog({
    schoolId: session.user.schoolId,
    actorUserId: session.user.id,
    action: "INVOICE_GENERATED",
    targetType: "Invoice",
    targetId: invoice.id,
    metadata: {
      studentId: student.id,
      sessionId,
      termId,
      includeOptional: parsed.data.includeOptional,
      itemCount: invoice.items.length,
      totalAmount: invoice.totalAmount,
      generatedFeeItemIds: netNewItems.map((item) => item.id),
      invoiceNumber: invoice.invoiceNumber,
    },
  });

  return NextResponse.json({
    ok: true,
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      balance: invoice.balance,
      status: invoice.status,
      studentName: invoice.student.user.name,
      termName: invoice.term.name,
      sessionName: invoice.session.name,
      items: invoice.items.map((item) => ({
        id: item.id,
        feeItemId: item.feeItemId,
        feeGroupName: item.feeItem.feeGroup.name,
        name: item.feeItem.name,
        category: item.feeItem.category,
        amount: item.amount,
      })),
    },
  });
}
