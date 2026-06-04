import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { AcademicCalendarService } from "@/modules/academic-setup/services/academic-calendar.service";

const createSessionSchema = z.object({
  name: z.string().min(3),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
});

const service = new AcademicCalendarService();

export async function GET() {
  const session = await auth();
  if (!session?.user?.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const setup = await service.getAcademicSetup(session.user.schoolId);
  return NextResponse.json(setup);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    console.log("Session API - user:", session?.user);
    if (!session?.user?.schoolId || !["SUPER_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL"].includes(session.user.role)) {
      return NextResponse.json({ error: `Unauthorized - no school assigned. Role: ${session?.user?.role}, schoolId: ${session?.user?.schoolId}` }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createSessionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const created = await service.createSession({
      schoolId: session.user.schoolId,
      ...parsed.data,
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
