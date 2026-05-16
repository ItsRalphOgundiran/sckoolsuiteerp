import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  invoiceId: z.string().min(5),
  amountPaid: z.coerce.number().positive(),
  paymentMethod: z.string().min(2),
  bankName: z.string().optional().default(""),
  transactionReference: z.string().min(3),
  paymentDate: z.string().min(4),
  proofPlaceholder: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT" || !session.user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const parent = await prisma.parent.findFirst({
    where: { schoolId: session.user.schoolId, userId: session.user.id },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: parsed.data.invoiceId,
      schoolId: session.user.schoolId,
      OR: [{ parentId: parent.id }, { student: { parentId: parent.id } }],
    },
    include: { student: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      schoolId: session.user.schoolId,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: parsed.data.amountPaid,
      method: parsed.data.paymentMethod,
      status: "PENDING",
    },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: "PENDING" },
  });

  await prisma.schoolSetting.upsert({
    where: { schoolId_key: { schoolId: session.user.schoolId, key: `parent_payment_meta_${payment.id}` } },
    update: {
      value: JSON.stringify({
        bankName: parsed.data.bankName,
        transactionReference: parsed.data.transactionReference,
        paymentDate: parsed.data.paymentDate,
        proofPlaceholder: parsed.data.proofPlaceholder,
      }),
    },
    create: {
      schoolId: session.user.schoolId,
      key: `parent_payment_meta_${payment.id}`,
      value: JSON.stringify({
        bankName: parsed.data.bankName,
        transactionReference: parsed.data.transactionReference,
        paymentDate: parsed.data.paymentDate,
        proofPlaceholder: parsed.data.proofPlaceholder,
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
