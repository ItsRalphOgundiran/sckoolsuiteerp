import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarCheck,
  FileBarChart,
  Megaphone,
  Receipt,
  User,
  Wallet,
  GraduationCap,
  Clock3,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext } from "@/lib/data";
import { formatDate, naira } from "@/lib/utils";
import { ParentInvoiceHub } from "@/app/parent/_components/parent-invoice-hub";
import { ParentMessagesPanel } from "@/app/parent/_components/parent-messages-panel";
import { ParentProfilePanel } from "@/app/parent/_components/parent-profile-panel";

const allowed = ["profile", "children", "fees", "payments", "attendance", "results", "report-cards", "school-calendar", "messages", "announcements", "lms"] as const;
type AllowedSection = (typeof allowed)[number];

const tabs: Record<AllowedSection, { title: string; description: string; icon: React.ReactNode }> = {
  profile: { title: "Profile & Settings", description: "Update parent profile details and emergency contact records.", icon: <User className="h-4 w-4" /> },
  children: { title: "Linked Children", description: "Comprehensive child portfolio: biodata, academics, attendance, and fee standing.", icon: <GraduationCap className="h-4 w-4" /> },
  fees: { title: "Fees & Invoices", description: "Invoice center with filters, fee breakdown, and payment-notice workflow.", icon: <Wallet className="h-4 w-4" /> },
  payments: { title: "Receipts", description: "Confirmed payment receipts and printable proof of payment.", icon: <Receipt className="h-4 w-4" /> },
  attendance: { title: "Attendance", description: "Attendance calendar/list with percentage and punctuality rating.", icon: <CalendarCheck className="h-4 w-4" /> },
  results: { title: "Results", description: "Term result summaries, GPA, comments, and subject performance tables.", icon: <FileBarChart className="h-4 w-4" /> },
  "report-cards": { title: "Report Cards", description: "Open and print full report cards for each child.", icon: <FileBarChart className="h-4 w-4" /> },
  "school-calendar": { title: "School Calendar", description: "Active session/term timeline and key resumption dates.", icon: <Clock3 className="h-4 w-4" /> },
  messages: { title: "Messages", description: "Send local messages to school/admin/teacher with status placeholders.", icon: <Megaphone className="h-4 w-4" /> },
  announcements: { title: "Announcements", description: "Official school announcements by audience and date.", icon: <Megaphone className="h-4 w-4" /> },
  lms: { title: "LMS Monitoring", description: "Lessons, assignments, teacher notes, and progress indicators.", icon: <BookOpen className="h-4 w-4" /> },
};

export default async function ParentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  const user = await requireRole(["PARENT"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return (
      <SetupRequiredScreen
        title="Account Setup Incomplete"
        message="Your parent account is not linked to a school yet. Please contact the school admin to complete your profile linkage."
      />
    );
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const core = await getCoreSchoolDataByContext(profile.schoolId, {
    sessionId: context.session?.id,
    termId: context.term?.id,
  });

  const parentProfile = core.parents.find((parent) => parent.userId === user.id);
  if (!parentProfile) {
    return (
      <SetupRequiredScreen
        title="Parent Profile Missing"
        message="Your user account is active but no parent profile exists yet. Ask an admin to create your parent record and link children."
      />
    );
  }

  const children = core.students.filter((student) => student.parentId === parentProfile.id);
  const childIds = new Set(children.map((child) => child.id));

  const invoices = core.invoices.filter((invoice) => childIds.has(invoice.studentId));
  const attendance = core.attendance.filter((row) => childIds.has(row.studentId));
  const scores = core.scores.filter((score) => childIds.has(score.studentId));
  const assignments = core.assignments.filter((assignment) => assignment.studentId && childIds.has(assignment.studentId));
  const lessons = core.lessons.filter((lesson) => children.some((child) => child.classId && child.classId === lesson.classId));

  const messageSettings = await prisma.schoolSetting.findMany({
    where: {
      schoolId: profile.schoolId,
      key: { startsWith: `parent_message_${parentProfile.id}_` },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const parentMessages = messageSettings
    .map((item) => {
      try {
        return JSON.parse(item.value) as { id: string; recipient: string; subject: string; message: string; status: string; createdAt: string };
      } catch {
        return null;
      }
    })
    .filter((item): item is { id: string; recipient: string; subject: string; message: string; status: string; createdAt: string } => Boolean(item));

  const [results, receipts] = await Promise.all([
    prisma.result.findMany({
      where: { schoolId: profile.schoolId, studentId: { in: Array.from(childIds) } },
      include: { student: { include: { user: true, class: true } }, term: true, session: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.receipt.findMany({
      where: { schoolId: profile.schoolId, OR: [{ parentId: parentProfile.id }, { studentId: { in: Array.from(childIds) } }] },
      include: { student: { include: { user: true } }, parent: { include: { user: true } }, school: { include: { branding: true } }, invoice: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const sectionKey = section as AllowedSection;
  const tab = tabs[sectionKey];

  const outstandingTotal = invoices.reduce((sum, item) => sum + item.balance, 0);
  const attendancePercent = attendance.length ? (attendance.filter((item) => item.status === "PRESENT").length / attendance.length) * 100 : 0;
  const punctualityLateRate = attendance.length ? (attendance.filter((item) => item.status === "LATE").length / attendance.length) * 100 : 0;
  const punctualityRating = punctualityLateRate <= 5 ? "Excellent" : punctualityLateRate <= 12 ? "Good" : "Needs attention";

  function childCard(childId: string) {
    const childAttendance = attendance.filter((item) => item.studentId === childId);
    const childInvoices = invoices.filter((item) => item.studentId === childId);
    const childResults = results.filter((item) => item.studentId === childId);
    const childAssignments = assignments.filter((item) => item.studentId === childId);

    return {
      attendanceSummary: `${childAttendance.filter((item) => item.status === "PRESENT").length} present / ${childAttendance.length} logs`,
      feeSummary: `${naira(childInvoices.reduce((sum, item) => sum + item.balance, 0))} outstanding`,
      resultSummary: childResults[0] ? `${childResults[0].termPercentage.toFixed(1)}% • ${childResults[0].termGrade}` : "No result summary",
      lmsActivity: `${childAssignments.filter((item) => item.submittedAt).length}/${childAssignments.length} submitted`,
      teacherComment: childResults[0]?.classTeacherComment ?? "No teacher comment yet",
    };
  }

  const invoiceHubData = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    studentId: invoice.studentId,
    studentName: invoice.student.user.name,
    className: invoice.class?.name,
    termName: invoice.term.name,
    sessionName: invoice.session.name,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    balance: invoice.balance,
    status: invoice.status,
    dueDate: invoice.dueDate?.toISOString() ?? null,
    paymentInstructions: invoice.paymentInstructions,
    items: invoice.items.map((item) => ({ id: item.id, name: item.feeItem.name, amount: item.amount })),
  }));

  return (
    <PortalShell
      role={user.role}
      schoolName={core.school?.name}
      schoolLogoUrl={core.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Parent"}
      pathname={`/parent/${section}`}
      currentSessionName={context.session?.name}
      currentTermName={context.term?.name}
      sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
      terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
      selectedSessionId={context.session?.id}
      selectedTermId={context.term?.id}
      primaryColor={core.school?.branding?.primaryColor}
      secondaryColor={core.school?.branding?.secondaryColor}
    >
      <section className="glass-panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Parent Portal</p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-900">{tab.icon}{tab.title}</h2>
            <p className="text-sm text-slate-600">{tab.description}</p>
          </div>
          <div className="metric-chip text-xs text-slate-600">{context.session?.name ?? "-"} / {context.term?.name ?? "-"}</div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-panel"><CardContent className="p-4"><p className="text-xs text-slate-500">Linked Children</p><p className="text-2xl font-semibold text-slate-900">{children.length}</p></CardContent></Card>
        <Card className="glass-panel"><CardContent className="p-4"><p className="text-xs text-slate-500">Outstanding Fees</p><p className="text-2xl font-semibold text-slate-900">{naira(outstandingTotal)}</p></CardContent></Card>
        <Card className="glass-panel"><CardContent className="p-4"><p className="text-xs text-slate-500">Attendance %</p><p className="text-2xl font-semibold text-slate-900">{attendancePercent.toFixed(1)}%</p></CardContent></Card>
        <Card className="glass-panel"><CardContent className="p-4"><p className="text-xs text-slate-500">Punctuality</p><p className="text-2xl font-semibold text-slate-900">{punctualityRating}</p></CardContent></Card>
      </section>

      {sectionKey === "children" ? (
        <section className="grid gap-3 xl:grid-cols-2">
          {children.length ? children.map((child) => {
            const summary = childCard(child.id);
            return (
              <Card key={child.id} className="glass-panel rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                  <CardTitle className="text-base">{child.user.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 text-sm">
                  <p><strong>Class:</strong> {child.class?.name ?? "Not assigned"}</p>
                  <p><strong>Admission Number:</strong> {child.id.slice(0, 10).toUpperCase()}</p>
                  <p><strong>Gender:</strong> {child.gender}</p>
                  <p><strong>Age:</strong> {child.age}</p>
                  <p><strong>Sport House:</strong> {child.sportHouse ?? "Not set"}</p>
                  <p><strong>Attendance Summary:</strong> {summary.attendanceSummary}</p>
                  <p><strong>Fee Summary:</strong> {summary.feeSummary}</p>
                  <p><strong>Result Summary:</strong> {summary.resultSummary}</p>
                  <p><strong>LMS Activity:</strong> {summary.lmsActivity}</p>
                  <p><strong>Teacher Comment:</strong> {summary.teacherComment}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Link href={`/reports/${child.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white">View Report</Link>
                    <Link href="/parent/fees" className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white">View Fees</Link>
                    <Link href="/parent/lms" className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white">View Lessons</Link>
                    <Link href="/parent/attendance" className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white">View Attendance</Link>
                  </div>
                </CardContent>
              </Card>
            );
          }) : <Card><CardContent className="p-6 text-sm text-slate-500">No linked children found.</CardContent></Card>}
        </section>
      ) : null}

      {sectionKey === "fees" ? (
        <ParentInvoiceHub
          childOptions={children.map((child) => ({ id: child.id, name: child.user.name }))}
          invoices={invoiceHubData}
          bank={{
            bankName: core.school?.branding?.bankName,
            bankAccountName: core.school?.branding?.bankAccountName,
            bankAccountNumber: core.school?.branding?.bankAccountNumber,
            bankInstructions: core.school?.branding?.bankInstructions,
          }}
        />
      ) : null}

      {sectionKey === "payments" ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle>Confirmed Receipts</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {receipts.length ? receipts.map((receipt) => (
              <div key={receipt.id} className="glass-soft rounded-xl p-3">
                <p className="font-medium">{receipt.receiptNumber}</p>
                <p>{receipt.student.user.name} • {naira(receipt.amount)} • {receipt.paymentMethod}</p>
                <p>Date: {formatDate(receipt.paymentDate)} • Balance: {naira(receipt.balance)}</p>
                <Link href={`/receipt/${receipt.id}`} className="text-[var(--brand-primary)] underline">Open Receipt</Link>
              </div>
            )) : <p className="text-slate-500">No confirmed receipts yet.</p>}
          </CardContent>
        </Card>
      ) : null}

      {sectionKey === "results" ? (
        <section className="space-y-3">
          {children.map((child) => {
            const latest = results.find((result) => result.studentId === child.id);
            const childScores = scores.filter((score) => score.studentId === child.id);
            return (
              <Card key={child.id} className="glass-panel">
                <CardHeader><CardTitle>{child.user.name} - Result Summary</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Term Percentage: {latest ? `${latest.termPercentage.toFixed(1)}%` : "-"}</p>
                  <p>Term Grade: {latest?.termGrade ?? "-"}</p>
                  <p>Term GPA: {latest ? latest.termGpa.toFixed(2) : "-"}</p>
                  <p>Class Teacher Comment: {latest?.classTeacherComment ?? "-"}</p>
                  <p>Principal Comment: {latest?.principalComment ?? "-"}</p>
                  <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
                    <p className="mb-2 font-medium">Subject Performance</p>
                    {childScores.length ? childScores.map((score) => (
                      <p key={score.id}>{score.subject.name}: {score.total}% ({score.grade})</p>
                    )) : <p className="text-slate-500">No subject performance records.</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : null}

      {sectionKey === "report-cards" ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle>Report Cards</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {children.map((child) => (
              <div key={child.id} className="glass-soft rounded-xl p-3">
                <p className="font-medium">{child.user.name}</p>
                <Link href={`/reports/${child.id}`} className="text-[var(--brand-primary)] underline">Open Full Report Card</Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {sectionKey === "lms" ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle>LMS Monitoring</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {children.map((child) => {
              const childAssignments = assignments.filter((item) => item.studentId === child.id);
              const childSubjects = core.subjects.filter((subject) => subject.classId && subject.classId === child.classId);
              const submitted = childAssignments.filter((item) => item.submittedAt).length;
              const progress = childAssignments.length ? (submitted / childAssignments.length) * 100 : 0;

              return (
                <div key={child.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{child.user.name}</p>
                  <p>Subjects: {childSubjects.map((item) => item.name).join(", ") || "-"}</p>
                  <p>Lessons: {lessons.filter((lesson) => lesson.classId && lesson.classId === child.classId).length}</p>
                  <p>Assignments: {childAssignments.length} • Submitted: {submitted}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Progress: {progress.toFixed(1)}% (monitor only, parent cannot submit)</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {sectionKey === "attendance" ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle>Attendance Calendar / List</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Present Days: {attendance.filter((item) => item.status === "PRESENT").length}</p>
            <p>Absent Days: {attendance.filter((item) => item.status === "ABSENT").length}</p>
            <p>Late Days: {attendance.filter((item) => item.status === "LATE").length}</p>
            <p>Attendance Percentage: {attendancePercent.toFixed(1)}%</p>
            <p>Punctuality Rating: {punctualityRating}</p>
            {attendance.slice(0, 20).map((item) => (
              <div key={item.id} className="glass-soft rounded-xl p-3">
                <p className="font-medium">{item.student.user.name}</p>
                <p>{item.status} • {formatDate(item.date)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {sectionKey === "announcements" ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {core.announcements.length ? core.announcements.slice(0, 20).map((item) => (
              <div key={item.id} className="glass-soft rounded-xl p-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">Date: {formatDate(item.createdAt)} • Audience: {item.audience}</p>
                <p>{item.body}</p>
                <p className="text-xs text-slate-500">Attachment: Placeholder</p>
              </div>
            )) : <p className="text-slate-500">No announcements published yet.</p>}
          </CardContent>
        </Card>
      ) : null}

      {sectionKey === "messages" ? <ParentMessagesPanel initialMessages={parentMessages} /> : null}
      {sectionKey === "profile" ? <ParentProfilePanel /> : null}

      {sectionKey === "school-calendar" ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle>School Calendar</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Session: {context.session?.name ?? "-"}</p>
            <p>Term: {context.term?.name ?? "-"}</p>
            <p>Term Start: {formatDate(context.term?.startDate)}</p>
            <p>Term End: {formatDate(context.term?.endDate)}</p>
            <p>Resumption: {formatDate(context.term?.resumptionDate)}</p>
          </CardContent>
        </Card>
      ) : null}
    </PortalShell>
  );
}
