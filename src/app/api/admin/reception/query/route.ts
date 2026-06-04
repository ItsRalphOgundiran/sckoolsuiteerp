import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit-log";

const querySchema = z.object({
  querierName: z.string().min(1).max(100),
  querierContact: z.string().optional().nullable(),
  queryType: z.string().min(1),
  subject: z.string().min(1).max(200),
  description: z.string().min(1),
});

function isAuthorized(role?: string) {
  return role ? ["SCHOOL_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "RECEPTIONIST"].includes(role) : false;
}

async function generateQueryNumber(schoolId: string): Promise<string> {
  const config = await prisma.schoolSetting.findUnique({
    where: { schoolId_key: { schoolId, key: "receptionConfig" } },
  });
  
  let prefix = "QUER";
  let digit = 3;
  
  if (config?.value) {
    try {
      const parsed = JSON.parse(config.value);
      if (parsed.query) {
        prefix = parsed.query.prefix || "QUER";
        digit = parsed.query.digit || 3;
      }
    } catch {}
  }

  const last = await prisma.query.findFirst({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
  });

  let nextNumber = 1;
  if (last?.queryNumber) {
    const match = last.queryNumber.match(/(\d+)$/);
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
    const queries = await prisma.query.findMany({
      where: { schoolId: session.user.schoolId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ queries });
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json({ error: "Failed to fetch queries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.schoolId || !isAuthorized(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const validated = querySchema.parse(json);
    
    const queryNumber = await generateQueryNumber(session.user.schoolId);

    const query = await prisma.query.create({
      data: {
        ...validated,
        queryNumber,
        schoolId: session.user.schoolId,
        status: "PENDING",
      },
    });

    await createAuditLog({
      userId: session.user.id!,
      schoolId: session.user.schoolId,
      action: "CREATE",
      entity: "Query",
      entityId: query.id,
      details: `Recorded query ${queryNumber}`,
    });

    return NextResponse.json({ query }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating query:", error);
    return NextResponse.json({ error: "Failed to create query" }, { status: 500 });
  }
}
