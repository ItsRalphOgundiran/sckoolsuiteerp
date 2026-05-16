import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  category: z.string().min(2),
  subject: z.string().min(3),
  complaint: z.string().min(10),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT" || !session.user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parent = await prisma.parent.findFirst({
    where: { schoolId: session.user.schoolId, userId: session.user.id },
  });

  if (!parent) return NextResponse.json([]);

  const items = await prisma.schoolSetting.findMany({
    where: {
      schoolId: session.user.schoolId,
      key: { startsWith: `parent_complaint_${parent.id}_` },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const complaints = items
    .map((item) => {
      try {
        return JSON.parse(item.value);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json(complaints);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT" || !session.user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parent = await prisma.parent.findFirst({
    where: { schoolId: session.user.schoolId, userId: session.user.id },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    id: `${Date.now()}`,
    category: parsed.data.category,
    subject: parsed.data.subject,
    complaint: parsed.data.complaint,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };

  await prisma.schoolSetting.create({
    data: {
      schoolId: session.user.schoolId,
      key: `parent_complaint_${parent.id}_${Date.now()}`,
      value: JSON.stringify(payload),
    },
  });

  return NextResponse.json({ ok: true, complaint: payload });
}
