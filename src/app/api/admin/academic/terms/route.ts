import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { AcademicCalendarService } from "@/modules/academic-setup/services/academic-calendar.service";

const createTermSchema = z.object({
  sessionId: z.string().min(5),
  name: z.enum(["First Term", "Second Term", "Third Term"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  resumptionDate: z.string().optional(),
  breakDates: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
});

const service = new AcademicCalendarService();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.schoolId || !["SCHOOL_ADMIN", "PRINCIPAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createTermSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await service.createTerm({
    schoolId: session.user.schoolId,
    ...parsed.data,
  });

  return NextResponse.json(created);
}
