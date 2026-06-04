import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSessionSchema = z.object({
  schoolId: z.string(),
  name: z.string().min(3),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// POST - Create session during setup (no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { schoolId, name, startDate, endDate } = parsed.data;

    // Check if school exists
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Check for duplicate session name
    const existing = await prisma.session.findFirst({
      where: { schoolId, name }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Session with this name already exists" },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        schoolId,
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: true,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
