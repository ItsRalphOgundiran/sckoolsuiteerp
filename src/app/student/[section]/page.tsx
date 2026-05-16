import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const allowed = ["profile", "subjects", "timetable", "assignments", "attendance", "lms", "results", "report-card", "announcements"] as const;

const titles: Record<(typeof allowed)[number], string> = {
  profile: "My Profile",
  subjects: "My Subjects",
  timetable: "Class Timetable",
  assignments: "Assignments",
  attendance: "Attendance",
  lms: "Lesson Notes & Assignments",
  results: "Result Summary",
  "report-card": "Report Card",
  announcements: "Announcements",
};

const descriptions: Record<(typeof allowed)[number], string> = {
  profile: "Your personal and class profile overview.",
  subjects: "Subjects you are currently taking this term.",
  timetable: "Your class and subject learning schedule.",
  assignments: "Track pending and submitted assignments.",
  attendance: "View your attendance record by date and status.",
  lms: "Access lessons, notes, and assignment learning content.",
  results: "Check latest scores and subject performance.",
  "report-card": "Open and print your report card.",
  announcements: "Read official school announcements.",
};

export default async function StudentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  const user = await requireRole(["STUDENT"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return (
      <SetupRequiredScreen
        title="Account Setup Incomplete"
        message="Your student account is not linked to a school yet. Please contact the school admin to complete your profile linkage."
      />
    );
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const core = await getCoreSchoolDataByContext(profile.schoolId, {
    sessionId: context.session?.id,
    termId: context.term?.id,
  });

  const studentProfile = core.students.find((student) => student.userId === user.id);
  const sectionKey = section as (typeof allowed)[number];

  if (!studentProfile) {
    return (
      <PortalShell
        role={user.role}
        schoolName={core.school?.name}
        schoolLogoUrl={core.school?.branding?.logoUrl}
        userName={user.name ?? "Student"}
        pathname={`/student/${section}`}
        currentSessionName={context.session?.name}
        currentTermName={context.term?.name}
        sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
        terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
        selectedSessionId={context.session?.id}
        selectedTermId={context.term?.id}
        primaryColor={core.school?.branding?.primaryColor}
        secondaryColor={core.school?.branding?.secondaryColor}
      >
        <Card>
          <CardHeader>
            <CardTitle>Student Record Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">No student profile is linked to your account yet.</CardContent>
        </Card>
      </PortalShell>
    );
  }

  const mySubjects = core.subjects.filter((subject) => subject.classId === studentProfile.classId);
  const myAssignments = core.assignments.filter((assignment) => assignment.studentId === studentProfile.id);
  const myAttendance = core.attendance.filter((attendance) => attendance.studentId === studentProfile.id);
  const myScores = core.scores.filter((score) => score.studentId === studentProfile.id);

  const pendingAssignments = myAssignments.filter((assignment) => !assignment.submittedAt).length;
  const presentCount = myAttendance.filter((item) => item.status === "PRESENT").length;
  const avgScore = myScores.length ? myScores.reduce((sum, score) => sum + score.total, 0) / myScores.length : 0;

  function renderSection() {
    switch (sectionKey) {
      case "profile":
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Name: {studentProfile.user.name}</p>
              <p>Email: {studentProfile.user.email}</p>
              <p>Class: {studentProfile.class?.name ?? "Not assigned"}</p>
              <p>Current Session: {context.session?.name ?? "-"}</p>
              <p>Current Term: {context.term?.name ?? "-"}</p>
            </CardContent>
          </Card>
        );

      case "subjects":
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mySubjects.length ? mySubjects.map((subject) => (
                <div key={subject.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{subject.name}</p>
                  <p>Teacher: {subject.teacher?.user.name ?? "Not assigned"}</p>
                </div>
              )) : <p className="text-slate-500">No subjects found for your class.</p>}
            </CardContent>
          </Card>
        );

      case "timetable":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Class Timetable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mySubjects.length ? mySubjects.map((subject, index) => (
                <div key={subject.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{subject.name}</p>
                  <p>Schedule Slot {index + 1} • Teacher: {subject.teacher?.user.name ?? "Not assigned"}</p>
                </div>
              )) : <p className="text-slate-500">Timetable entries will appear when subjects are assigned.</p>}
            </CardContent>
          </Card>
        );

      case "assignments":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {myAssignments.length ? myAssignments.map((assignment) => (
                <div key={assignment.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{assignment.title}</p>
                  <p>{assignment.subject?.name ?? "Subject"} • Due: {formatDate(assignment.dueDate)}</p>
                  <p>Status: {assignment.submittedAt ? "Submitted" : "Pending"}</p>
                </div>
              )) : <p className="text-slate-500">No assignments available.</p>}
            </CardContent>
          </Card>
        );

      case "attendance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Present days: {presentCount} / {myAttendance.length}</p>
              {myAttendance.slice(0, 20).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.status}</p>
                  <p>{formatDate(item.date)} • Class: {item.class?.name ?? "-"}</p>
                </div>
              ))}
              {!myAttendance.length ? <p className="text-slate-500">No attendance records available.</p> : null}
            </CardContent>
          </Card>
        );

      case "lms":
        return (
          <Card>
            <CardHeader>
              <CardTitle>LMS Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {core.lessons.filter((lesson) => lesson.classId === studentProfile.classId).slice(0, 20).map((lesson) => (
                <div key={lesson.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{lesson.title}</p>
                  <p>{lesson.subject?.name ?? "Subject"} • Uploaded: {formatDate(lesson.createdAt)}</p>
                </div>
              ))}
              {!core.lessons.filter((lesson) => lesson.classId === studentProfile.classId).length ? <p className="text-slate-500">No lesson notes available.</p> : null}
            </CardContent>
          </Card>
        );

      case "results":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Result Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Average Score: {avgScore.toFixed(1)}%</p>
              {myScores.slice(0, 20).map((score) => (
                <div key={score.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{score.subject.name}</p>
                  <p>Total: {score.total}% • Grade: {score.grade} • GPA: {score.gpa.toFixed(2)}</p>
                </div>
              ))}
              {!myScores.length ? <p className="text-slate-500">No results published yet.</p> : null}
            </CardContent>
          </Card>
        );

      case "report-card":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Report Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Session: {context.session?.name ?? "-"}</p>
              <p>Term: {context.term?.name ?? "-"}</p>
              <Link href={`/reports/${studentProfile.id}`} className="inline-block text-[var(--brand-primary)] underline">
                Open My Report Card
              </Link>
            </CardContent>
          </Card>
        );

      case "announcements":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {core.announcements.slice(0, 20).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-slate-600">{item.body.slice(0, 180)}</p>
                  <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                </div>
              ))}
              {!core.announcements.length ? <p className="text-slate-500">No announcements available.</p> : null}
            </CardContent>
          </Card>
        );
    }
  }

  return (
    <PortalShell
      role={user.role}
      schoolName={core.school?.name}
      schoolLogoUrl={core.school?.branding?.logoUrl}
      userName={user.name ?? "Student"}
      pathname={`/student/${section}`}
      currentSessionName={context.session?.name}
      currentTermName={context.term?.name}
      sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
      terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
      selectedSessionId={context.session?.id}
      selectedTermId={context.term?.id}
      primaryColor={core.school?.branding?.primaryColor}
      secondaryColor={core.school?.branding?.secondaryColor}
    >
      <Card>
        <CardHeader>
          <CardTitle>{titles[sectionKey]}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">{descriptions[sectionKey]}</CardContent>
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Class</p><p className="text-xl font-semibold">{studentProfile.class?.name ?? "N/A"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Subjects</p><p className="text-xl font-semibold">{mySubjects.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Pending Tasks</p><p className="text-xl font-semibold">{pendingAssignments}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Average Score</p><p className="text-xl font-semibold">{avgScore.toFixed(1)}%</p></CardContent></Card>
      </section>

      {renderSection()}
    </PortalShell>
  );
}
