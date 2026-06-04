import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit-log";

const callLogSchema = z.object({
  callerName: z.string().min(1).max(100),
  callerPhone: z.string().min(1),
  purpose: z.string().min(1),
  recipient: z.string().optional().nullable(),
  duration: z.number().default(0),
  notes: z.string().optional().nullable(),
});

function isAuthorized(role?: string) {
  return role ? ["SCHOOL_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "RECEPTIONIST"].includes(role) : false;
}

async function generateCallNumber(schoolId: string): Promise<string> {
  const config = await prisma.schoolSetting.findUnique({
    where: { schoolId_key: { schoolId, key: "receptionConfig" } },
  });
  
  let prefix = "CALL";
  let digit = 3;
  
  if (config?.value) {
    try {
      const parsed = JSON.parse(config.value);
      if (parsed.callLog) {
        prefix = parsed.callLog.prefix || "CALL";
        digit = parsed.callLog.digit || 3;
      }
    } catch {}
  }

  const last = await prisma.callLog.findFirst({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;
  if (last?.callNumber) {
    const match = last.callNumber.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(digit, "0")}`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.schoolId || !isAuthorized(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const calls = await prisma.callLog.findMany({
      where: { schoolId: session.user.schoolId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error("Error fetching call logs:", error);
    return NextResponse.json({ error: "Failed to fetch call logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.schoolId || !isAuthorized(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const validated = callLogSchema.parse(json);
    
    const callNumber = await generateCallNumber(session.user.schoolId);

    const call = await prisma.callLog.create({
      data: {
        ...validated,
        callNumber,
        schoolId: session.user.schoolId,
        status: "COMPLETED",
      },
    });

    await createAuditLog({
      userId: session.user.id!,
      schoolId: session.user.schoolId,
      action: "CREATE",
      entity: "CallLog",
      entityId: call.id,
      details: `Logged call ${callNumber}`,
    });

    return NextResponse.json({ call }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating call log:", error);
    return NextResponse.json({ error: "Failed to create call log" }, { status: 500 });
  }
}
