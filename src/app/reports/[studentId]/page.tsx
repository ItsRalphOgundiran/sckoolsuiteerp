import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { APP_POWERED_BY } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/print-button";

export default async function ReportCardPage({ params }: { params: Promise<{ studentId: string }> }) {
  await requireUser();
  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: { include: { branding: true } },
      user: true,
      class: true,
      parent: { include: { user: true } },
      teacher: { include: { user: true } },
      results: { include: { term: true, session: true }, orderBy: { createdAt: "desc" }, take: 1 },
      scores: { include: { subject: true }, orderBy: { subject: { name: "asc" } } },
      attendance: true,
    },
  });

  if (!student) notFound();

  const result = student.results[0];

  return (
    <div className="p-4">
      <div className="no-print mx-auto mb-3 flex max-w-[210mm] justify-end">
        <PrintButton />
      </div>
      <div className="print-sheet rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="mb-4 border-b pb-4">
          <h1 className="text-2xl font-semibold">{student.school.name} Report Card</h1>
          <p className="text-sm">{student.school.branding?.reportHeaderText ?? student.school.motto}</p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div>
            <p className="font-semibold">Student</p>
            <p>{student.user.name}</p>
            <p>Gender: {student.gender}</p>
            <p>Age: {student.age}</p>
            <p>Class: {student.class?.name ?? "-"}</p>
          </div>
          <div>
            <p className="font-semibold">Parent</p>
            <p>{student.parent?.user.name ?? "-"}</p>
            <p>Sport House: {student.sportHouse ?? "-"}</p>
            <p>Co-curricular: {student.coCurricular ?? "-"}</p>
            <p>Responsibilities: {student.responsibilities ?? "-"}</p>
          </div>
          <div>
            <div className="h-24 w-24 rounded border border-dashed border-slate-400 text-center text-xs leading-[96px]">
              Passport
            </div>
            <p className="mt-2 text-xs">Session: {result?.session.name ?? "2025/2026"}</p>
            <p className="text-xs">Term: {result?.term.name ?? "First Term"}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Subject</th>
              <th className="border p-2">CA</th>
              <th className="border p-2">Exam</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Grade</th>
              <th className="border p-2">GPA</th>
            </tr>
          </thead>
          <tbody>
            {student.scores.map((score) => (
              <tr key={score.id}>
                <td className="border p-2">{score.subject.name}</td>
                <td className="border p-2 text-center">{score.caScore}</td>
                <td className="border p-2 text-center">{score.examScore}</td>
                <td className="border p-2 text-center">{score.total}</td>
                <td className="border p-2 text-center">{score.grade}</td>
                <td className="border p-2 text-center">{score.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
          <div className="space-y-1 rounded border p-3">
            <p>Cumulative Total: <strong>{result?.cumulativeTotal ?? 0}</strong></p>
            <p>Average: <strong>{result?.average ?? 0}</strong></p>
            <p>Term Percentage: <strong>{result?.termPercentage ?? 0}%</strong></p>
            <p>Term Grade: <strong>{result?.termGrade ?? "-"}</strong></p>
            <p>Term GPA: <strong>{result?.termGpa ?? 0}</strong></p>
            <p>Attendance: <strong>{result?.attendancePresent ?? 0}/{result?.attendanceTotal ?? 0}</strong></p>
          </div>
          <div className="space-y-1 rounded border p-3">
            <p>Cognitive: {result?.cognitiveAssessment ?? "-"}</p>
            <p>Affective: {result?.affectiveAssessment ?? "-"}</p>
            <p>Psychomotor: {result?.psychomotorAssessment ?? "-"}</p>
            <p>Class Teacher: {result?.classTeacherComment ?? "-"}</p>
            <p>Principal: {result?.principalComment ?? "-"}</p>
            <p>Next Term Resumes: {result?.nextTermResumption ? formatDate(result.nextTermResumption) : "-"}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded border p-3">Teacher Signature: {student.school.branding?.teacherSignature ?? "Teacher Signature Placeholder"}</div>
          <div className="rounded border p-3">Head Signature: {student.school.branding?.principalSignature ?? "Head Signature Placeholder"}</div>
        </div>

        <p className="mt-4 text-right text-xs text-slate-500">{APP_POWERED_BY}</p>
      </div>
    </div>
  );
}
