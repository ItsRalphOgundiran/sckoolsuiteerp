import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTermSchema = z.object({
  schoolId: z.string(),
  sessionId: z.string(),
  name: z.string().min(2),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// POST - Create term during setup (no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTermSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { schoolId, sessionId, name, startDate, endDate } = parsed.data;

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: { id: sessionId, schoolId }
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check for duplicate term name in session
    const existing = await prisma.term.findFirst({
      where: { schoolId, sessionId, name }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Term with this name already exists in this session" },
        { status: 400 }
      );
    }

    const term = await prisma.term.create({
      data: {
        schoolId,
        sessionId,
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: true,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(term);
  } catch (error) {
    console.error("Term creation error:", error);
    return NextResponse.json(
      { error: "Failed to create term" },
      { status: 500 }
    );
  }
}
