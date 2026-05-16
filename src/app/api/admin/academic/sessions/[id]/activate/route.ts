import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AcademicCalendarService } from "@/modules/academic-setup/services/academic-calendar.service";

const service = new AcademicCalendarService();

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.schoolId || !["SCHOOL_ADMIN", "PRINCIPAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const updated = await service.activateSession(session.user.schoolId, id);
  return NextResponse.json(updated);
}
