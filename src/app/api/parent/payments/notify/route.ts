import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  invoiceId: z.string().min(5),
  amountPaid: z.coerce.number().positive(),
  paymentMethod: z.string().min(2),
  bankName: z.string().optional().default(""),
  transactionReference: z.string().min(3),
  paymentDate: z.string().min(4),
});

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT" || !session.user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  const body = contentType.includes("multipart/form-data")
    ? (() => {
        return request.formData().then((formData) => ({
          invoiceId: String(formData.get("invoiceId") ?? ""),
          amountPaid: String(formData.get("amountPaid") ?? ""),
          paymentMethod: String(formData.get("paymentMethod") ?? ""),
          bankName: String(formData.get("bankName") ?? ""),
          transactionReference: String(formData.get("transactionReference") ?? ""),
          paymentDate: String(formData.get("paymentDate") ?? ""),
          proofFile: formData.get("proofFile"),
        }));
      })()
    : request.json().then((json) => ({ ...json, proofFile: null }));

  const payload = await body;
  const parsed = schema.safeParse(payload);
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

  const proofFile = payload.proofFile instanceof File ? payload.proofFile : null;
  if (proofFile) {
    if (!ALLOWED_TYPES.has(proofFile.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WEBP, and PDF proofs are allowed" }, { status: 400 });
    }
    if (proofFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Payment proof must be 8MB or less" }, { status: 400 });
    }
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

  let proofUrl: string | null = null;
  if (proofFile) {

    const safeName = sanitizeFileName(proofFile.name || "payment-proof");
    const fileName = `${Date.now()}-${safeName}`;
    const relativeDir = path.join("uploads", session.user.schoolId, "payments");
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    const absolutePath = path.join(absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    const bytes = await proofFile.arrayBuffer();
    await writeFile(absolutePath, Buffer.from(bytes));
    proofUrl = `/${relativeDir.replace(/\\/g, "/")}/${fileName}`;
  }

  await prisma.paymentProof.upsert({
    where: { paymentId: payment.id },
    update: {
      bankName: parsed.data.bankName || null,
      transactionReference: parsed.data.transactionReference,
      paymentDate: new Date(parsed.data.paymentDate),
      proofUrl,
    },
    create: {
      schoolId: session.user.schoolId,
      paymentId: payment.id,
      bankName: parsed.data.bankName || null,
      transactionReference: parsed.data.transactionReference,
      paymentDate: new Date(parsed.data.paymentDate),
      proofUrl,
    },
  });

  await createAuditLog({
    schoolId: session.user.schoolId,
    actorUserId: session.user.id,
    action: "PAYMENT_NOTICE_SUBMITTED",
    targetType: "Payment",
    targetId: payment.id,
    metadata: {
      invoiceId: invoice.id,
      amount: parsed.data.amountPaid,
      method: parsed.data.paymentMethod,
      hasProofFile: Boolean(proofUrl),
    },
  });

  return NextResponse.json({ ok: true });
}
