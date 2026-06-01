import { AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { AcademicCalendarService } from "@/modules/academic-setup/services/academic-calendar.service";

const schema = z.object({
  studentId: z.string().min(5),
  classId: z.string().min(5),
  date: z.string().min(8),
  status: z.nativeEnum(AttendanceStatus),
});

const calendarService = new AcademicCalendarService();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.schoolId || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const teacher = await prisma.teacher.findFirst({
    where: { schoolId: session.user.schoolId, userId: session.user.id },
  });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
  }

  const classRecord = await prisma.class.findFirst({
    where: { id: parsed.data.classId, schoolId: session.user.schoolId },
  });
  if (!classRecord || classRecord.teacherId !== teacher.id) {
    return NextResponse.json({ error: "You can only record attendance for your assigned classes" }, { status: 403 });
  }

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, schoolId: session.user.schoolId, classId: parsed.data.classId },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found in selected class" }, { status: 404 });
  }

  const context = await calendarService.getUserContext(session.user.schoolId, session.user.id);
  if (!context.sessionId || !context.termId) {
    return NextResponse.json({ error: "Academic context is not selected" }, { status: 400 });
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid attendance date" }, { status: 400 });
  }

  const existing = await prisma.attendance.findFirst({
    where: {
      schoolId: session.user.schoolId,
      studentId: student.id,
      classId: classRecord.id,
      sessionId: context.sessionId,
      termId: context.termId,
      date,
    },
  });

  const attendance = existing
    ? await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: parsed.data.status, teacherId: teacher.id },
      })
    : await prisma.attendance.create({
        data: {
          schoolId: session.user.schoolId,
          studentId: student.id,
          classId: classRecord.id,
          teacherId: teacher.id,
          sessionId: context.sessionId,
          termId: context.termId,
          date,
          status: parsed.data.status,
        },
      });

  await createAuditLog({
    schoolId: session.user.schoolId,
    actorUserId: session.user.id,
    action: existing ? "ATTENDANCE_UPDATED" : "ATTENDANCE_CREATED",
    targetType: "Attendance",
    targetId: attendance.id,
    metadata: {
      studentId: student.id,
      classId: classRecord.id,
      status: attendance.status,
      date: attendance.date.toISOString(),
    },
  });

  return NextResponse.json({ ok: true, attendanceId: attendance.id });
}
