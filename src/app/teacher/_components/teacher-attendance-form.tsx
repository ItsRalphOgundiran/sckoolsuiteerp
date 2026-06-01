"use client";

import { useMemo, useState } from "react";

type ClassOption = {
  id: string;
  name: string;
  students: Array<{ id: string; name: string }>;
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export function TeacherAttendanceForm({ classOptions }: { classOptions: ClassOption[] }) {
  const [classId, setClassId] = useState(classOptions[0]?.id ?? "");
  const [studentId, setStudentId] = useState(classOptions[0]?.students[0]?.id ?? "");
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedClass = useMemo(() => classOptions.find((item) => item.id === classId) ?? null, [classId, classOptions]);
  const students = selectedClass?.students ?? [];

  async function submit() {
    if (!classId || !studentId) {
      setMessage("Select class and student first.");
      return;
    }

    setSubmitting(true);
    setMessage("Saving attendance...");

    const response = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, studentId, status, date }),
    });

    const payload = await response.json().catch(() => ({}));
    setSubmitting(false);
    if (!response.ok) {
      setMessage(payload?.error ?? "Could not save attendance.");
      return;
    }

    setMessage("Attendance saved successfully.");
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Mark Attendance</p>
      <div className="grid gap-2 md:grid-cols-2">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={classId} onChange={(event) => {
          const nextClassId = event.target.value;
          setClassId(nextClassId);
          const nextClass = classOptions.find((item) => item.id === nextClassId);
          setStudentId(nextClass?.students[0]?.id ?? "");
        }}>
          {classOptions.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>

        <select className="rounded-md border border-slate-300 px-3 py-2" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
          {students.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>

        <select className="rounded-md border border-slate-300 px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value as AttendanceStatus)}>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
          <option value="EXCUSED">Excused</option>
        </select>

        <input type="date" className="rounded-md border border-slate-300 px-3 py-2" value={date} onChange={(event) => setDate(event.target.value)} />
      </div>

      <button type="button" disabled={submitting} className="rounded-md bg-[var(--brand-primary)] px-3 py-2 text-white disabled:opacity-60" onClick={submit}>
        {submitting ? "Saving..." : "Save Attendance"}
      </button>

      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}
