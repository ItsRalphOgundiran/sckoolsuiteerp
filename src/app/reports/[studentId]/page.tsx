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
  const cumulativeTotal = result?.cumulativeTotal ?? student.scores.reduce((sum, score) => sum + score.total, 0);
  const average = result?.average ?? (student.scores.length ? cumulativeTotal / student.scores.length : 0);
  const attendancePresent = result?.attendancePresent ?? student.attendance.filter((item) => item.status === "PRESENT").length;
  const attendanceTotal = result?.attendanceTotal ?? student.attendance.length;
  const termPercentage = result?.termPercentage ?? average;
  const termGpa = result?.termGpa ?? (student.scores.length ? student.scores.reduce((sum, score) => sum + score.gpa, 0) / student.scores.length : 0);
  const themePrimary = student.school.branding?.primaryColor ?? "#0B1F4D";
  const themeSecondary = student.school.branding?.secondaryColor ?? "#0E9F6E";
  const normalizeAssetUrl = (assetUrl: string | null | undefined) => {
    if (!assetUrl) return undefined;
    if (assetUrl.startsWith("http://") || assetUrl.startsWith("https://") || assetUrl.startsWith("/")) {
      return assetUrl;
    }
    return `/${assetUrl}`;
  };

  const schoolLogoUrl = normalizeAssetUrl(student.school.branding?.logoUrl);
  const teacherSignatureUrl = normalizeAssetUrl(student.school.branding?.teacherSignature);
  const principalSignatureUrl = normalizeAssetUrl(student.school.branding?.principalSignature);
  const normalizedPassportUrl = student.passportUrl
    ? student.passportUrl.startsWith("http://") || student.passportUrl.startsWith("https://") || student.passportUrl.startsWith("/")
      ? student.passportUrl
      : `/${student.passportUrl}`
    : undefined;
  const fallbackPassport = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.user.name)}&background=0B1F4D&color=FFFFFF&size=160&bold=true`;

  return (
    <div className="p-4" style={{ "--report-primary": themePrimary, "--report-secondary": themeSecondary } as React.CSSProperties}>
      <div className="no-print mx-auto mb-3 flex max-w-[210mm] justify-end">
        <PrintButton />
      </div>
      <div className="print-sheet overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
        <div className="bg-[var(--report-primary)] px-6 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-wide">{student.school.name}</h1>
              <p className="text-sm text-white/90">{student.school.branding?.reportHeaderText ?? student.school.motto ?? "Comprehensive Term Report"}</p>
            </div>
            {schoolLogoUrl ? (
              <div className="rounded-lg border border-white/30 bg-white/10 p-1">
                <img src={schoolLogoUrl} alt={`${student.school.name} logo`} className="h-14 w-14 rounded bg-white object-contain p-1" />
              </div>
            ) : null}
          </div>
          <p className="mt-2 inline-block rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em]">
            Report Card • {result?.term.name ?? "First Term"} • {result?.session.name ?? "2025/2026"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-4 text-sm md:grid-cols-[132px_1fr_1fr]">
          <div className="rounded-lg border border-slate-300 bg-white p-1">
            <img
              src={normalizedPassportUrl ?? fallbackPassport}
              alt={`${student.user.name} passport`}
              className="h-[122px] w-full rounded object-cover"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Student Profile</p>
            <p className="text-base font-semibold text-slate-900">{student.user.name}</p>
            <p>Class: <strong>{student.class?.name ?? "-"}</strong></p>
            <p>Gender: <strong>{student.gender}</strong> • Age: <strong>{student.age}</strong></p>
            <p>Parent: <strong>{student.parent?.user.name ?? "-"}</strong></p>
            <p>Sport House: <strong>{student.sportHouse ?? "-"}</strong></p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Learning Profile</p>
            <p>Co-curricular: <strong>{student.coCurricular ?? "-"}</strong></p>
            <p>Responsibilities: <strong>{student.responsibilities ?? "-"}</strong></p>
            <p>Class Teacher: <strong>{student.teacher?.user.name ?? "-"}</strong></p>
            <p className="mt-2 text-xs text-slate-600">Generated: {formatDate(new Date())}</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-[var(--report-secondary)]" style={{ width: `${Math.max(8, Math.min(100, termPercentage))}%` }} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="overflow-hidden rounded-lg border border-slate-300">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--report-primary)]/95 text-white">
                  <th className="border border-slate-300 p-2 text-left">Subject</th>
                  <th className="border border-slate-300 p-2">CA</th>
                  <th className="border border-slate-300 p-2">Exam</th>
                  <th className="border border-slate-300 p-2">Total</th>
                  <th className="border border-slate-300 p-2">Grade</th>
                  <th className="border border-slate-300 p-2">GPA</th>
                </tr>
              </thead>
              <tbody>
                {student.scores.map((score, index) => (
                  <tr key={score.id} className={index % 2 ? "bg-slate-50" : "bg-white"}>
                    <td className="border border-slate-300 p-2 font-medium text-slate-800">{score.subject.name}</td>
                    <td className="border border-slate-300 p-2 text-center">{score.caScore}</td>
                    <td className="border border-slate-300 p-2 text-center">{score.examScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">{score.total}</td>
                    <td className="border border-slate-300 p-2 text-center">{score.grade}</td>
                    <td className="border border-slate-300 p-2 text-center">{score.gpa.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="rounded-lg border border-slate-300 bg-[#fff8db] p-3 text-center text-xs">
              <p className="text-slate-500">Cumulative</p>
              <p className="text-lg font-bold text-slate-900">{cumulativeTotal.toFixed(1)}</p>
            </div>
            <div className="rounded-lg border border-slate-300 bg-[#e8f7ff] p-3 text-center text-xs">
              <p className="text-slate-500">Average</p>
              <p className="text-lg font-bold text-slate-900">{average.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-slate-300 bg-[#edfce9] p-3 text-center text-xs">
              <p className="text-slate-500">Term Grade</p>
              <p className="text-lg font-bold text-slate-900">{result?.termGrade ?? "-"}</p>
            </div>
            <div className="rounded-lg border border-slate-300 bg-[#ffeef0] p-3 text-center text-xs">
              <p className="text-slate-500">Term %</p>
              <p className="text-lg font-bold text-slate-900">{termPercentage.toFixed(1)}</p>
            </div>
            <div className="rounded-lg border border-slate-300 bg-[#f1ecff] p-3 text-center text-xs">
              <p className="text-slate-500">Term GPA</p>
              <p className="text-lg font-bold text-slate-900">{termGpa.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-300 bg-white p-3 text-xs">
              <p className="mb-1 font-semibold uppercase tracking-wide text-slate-600">Assessment Notes</p>
              <p>Cognitive: {result?.cognitiveAssessment ?? "-"}</p>
              <p>Affective: {result?.affectiveAssessment ?? "-"}</p>
              <p>Psychomotor: {result?.psychomotorAssessment ?? "-"}</p>
              <p className="mt-1">Attendance: <strong>{attendancePresent}/{attendanceTotal}</strong></p>
              <p>Resumption: <strong>{result?.nextTermResumption ? formatDate(result.nextTermResumption) : "-"}</strong></p>
            </div>

            <div className="rounded-lg border border-slate-300 bg-white p-3 text-xs">
              <p className="mb-1 font-semibold uppercase tracking-wide text-slate-600">Teacher & Principal Comments</p>
              <p><strong>Class Teacher:</strong> {result?.classTeacherComment ?? "-"}</p>
              <p className="mt-2"><strong>Principal:</strong> {result?.principalComment ?? "-"}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
              <p className="mb-1 font-semibold text-slate-700">Teacher Signature</p>
              {teacherSignatureUrl ? (
                <img src={teacherSignatureUrl} alt="Teacher signature" className="h-12 max-w-[170px] object-contain" />
              ) : (
                <p className="text-slate-500">Teacher signature not uploaded.</p>
              )}
            </div>
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
              <p className="mb-1 font-semibold text-slate-700">Head Signature</p>
              {principalSignatureUrl ? (
                <img src={principalSignatureUrl} alt="Head signature" className="h-12 max-w-[170px] object-contain" />
              ) : (
                <p className="text-slate-500">Head signature not uploaded.</p>
              )}
            </div>
          </div>

          <p className="mt-4 text-right text-xs text-slate-500">{APP_POWERED_BY}</p>
        </div>
      </div>
    </div>
  );
}
