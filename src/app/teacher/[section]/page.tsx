import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherAttendanceForm } from "@/app/teacher/_components/teacher-attendance-form";
import { TeacherScoreEntryForm } from "@/app/teacher/_components/teacher-score-entry-form";
import { requireRole } from "@/lib/auth-guards";
import { getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext } from "@/lib/data";
import { formatDate, humanizeEnum } from "@/lib/utils";

const allowed = [
  "my-classes",
  "my-subjects",
  "attendance",
  "score-entry",
  "assignments",
  "lesson-notes",
  "timetable",
  "student-reports",
  "lms",
  "announcements",
  "scores",
  "comments",
] as const;

type AllowedSection = (typeof allowed)[number];

const aliases: Record<AllowedSection, Exclude<AllowedSection, "scores" | "comments">> = {
  "my-classes": "my-classes",
  "my-subjects": "my-subjects",
  attendance: "attendance",
  "score-entry": "score-entry",
  assignments: "assignments",
  "lesson-notes": "lesson-notes",
  timetable: "timetable",
  "student-reports": "student-reports",
  lms: "lms",
  announcements: "announcements",
  scores: "score-entry",
  comments: "announcements",
};

const titles: Record<Exclude<AllowedSection, "scores" | "comments">, string> = {
  "my-classes": "My Classes",
  "my-subjects": "My Subjects",
  attendance: "Attendance",
  "score-entry": "Score Entry",
  assignments: "Assignments",
  "lesson-notes": "Lesson Notes",
  timetable: "Timetable",
  "student-reports": "Student Reports",
  lms: "LMS Workspace",
  announcements: "Announcements",
};

const descriptions: Record<Exclude<AllowedSection, "scores" | "comments">, string> = {
  "my-classes": "View all classes assigned to you this session and term.",
  "my-subjects": "Review your subject load and mapped class groups.",
  attendance: "Mark and monitor attendance records for your classes.",
  "score-entry": "Manage CA and exam scores for assigned subjects.",
  assignments: "Track assignment publishing and submission status.",
  "lesson-notes": "Manage uploaded lesson notes and teaching content.",
  timetable: "Preview your teaching timetable and lesson sequence.",
  "student-reports": "Inspect learner performance and report readiness.",
  lms: "Combined learning operations for lessons and assignments.",
  announcements: "Stay updated with school notices and announcements.",
};

export default async function TeacherSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  const user = await requireRole(["TEACHER"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return (
      <SetupRequiredScreen
        title="Account Setup Incomplete"
        message="Your teacher account is not linked to a school yet. Please contact the school admin to complete your profile linkage."
      />
    );
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const core = await getCoreSchoolDataByContext(profile.schoolId, {
    sessionId: context.session?.id,
    termId: context.term?.id,
  });

  const teacher = core.teachers.find((item) => item.userId === user.id);
  if (!teacher) {
    return (
      <SetupRequiredScreen
        title="Teacher Profile Missing"
        message="Your user account is active but no teacher profile exists yet. Ask an admin to create your teacher record."
      />
    );
  }

  const myClasses = core.classes.filter((item) => item.teacherId === teacher.id);
  const classIds = new Set(myClasses.map((item) => item.id));
  const mySubjects = core.subjects.filter((item) => item.teacherId === teacher.id || (item.classId ? classIds.has(item.classId) : false));
  const subjectIds = new Set(mySubjects.map((item) => item.id));
  const myScores = core.scores.filter((item) => subjectIds.has(item.subjectId));
  const myLessons = core.lessons.filter((item) => item.teacherId === teacher.id);
  const myAssignments = core.assignments.filter((item) => item.subjectId && subjectIds.has(item.subjectId));
  const myAttendance = core.attendance.filter((item) => item.classId && classIds.has(item.classId));
  const myStudents = core.students.filter((item) => item.classId && classIds.has(item.classId));

  const canonical = aliases[section as AllowedSection];

  function renderSection() {
    switch (canonical) {
      case "my-classes":
        return (
          <Card>
            <CardHeader><CardTitle>Assigned Classes</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {myClasses.length ? myClasses.map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.name}</p>
                  <p>Students: {item.students.length}</p>
                </div>
              )) : <p className="text-slate-500">No classes assigned to you yet.</p>}
            </CardContent>
          </Card>
        );
      case "my-subjects":
        return (
          <Card>
            <CardHeader><CardTitle>Assigned Subjects</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mySubjects.length ? mySubjects.map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.name}</p>
                  <p>Class: {item.class?.name ?? "No class mapping"}</p>
                </div>
              )) : <p className="text-slate-500">No subjects assigned.</p>}
            </CardContent>
          </Card>
        );
      case "attendance":
        return (
          <div className="space-y-3">
            <TeacherAttendanceForm
              classOptions={myClasses.map((item) => ({
                id: item.id,
                name: item.name,
                students: myStudents
                  .filter((student) => student.classId === item.id)
                  .map((student) => ({ id: student.id, name: student.user.name })),
              }))}
            />
            <Card>
              <CardHeader><CardTitle>Attendance Records</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {myAttendance.slice(0, 20).map((item) => (
                  <div key={item.id} className="glass-soft rounded-xl p-3">
                    <p className="font-medium">{item.student.user.name}</p>
                    <p>{item.class?.name ?? "Class"} • {humanizeEnum(item.status)} • {formatDate(item.date)}</p>
                  </div>
                ))}
                {!myAttendance.length ? <p className="text-slate-500">No attendance records yet.</p> : null}
              </CardContent>
            </Card>
          </div>
        );
      case "score-entry":
        return (
          <div className="space-y-3">
            <TeacherScoreEntryForm
              subjectOptions={mySubjects.map((item) => ({ id: item.id, name: item.name, classId: item.classId }))}
              studentOptions={myStudents.map((item) => ({ id: item.id, name: item.user.name, classId: item.classId }))}
            />
            <Card>
              <CardHeader><CardTitle>Score Entry Queue</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {myScores.slice(0, 20).map((item) => (
                  <div key={item.id} className="glass-soft rounded-xl p-3">
                    <p className="font-medium">{item.student.user.name} • {item.subject.name}</p>
                    <p>CA: {item.caScore} • Exam: {item.examScore} • Total: {item.total}%</p>
                  </div>
                ))}
                {!myScores.length ? <p className="text-slate-500">No score rows yet for your subjects.</p> : null}
              </CardContent>
            </Card>
          </div>
        );
      case "assignments":
        return (
          <Card>
            <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {myAssignments.slice(0, 20).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.title}</p>
                  <p>Subject: {item.subject?.name ?? "-"} • Due: {formatDate(item.dueDate)}</p>
                </div>
              ))}
              {!myAssignments.length ? <p className="text-slate-500">No assignments created for your subjects.</p> : null}
            </CardContent>
          </Card>
        );
      case "lesson-notes":
        return (
          <Card>
            <CardHeader><CardTitle>Lesson Notes</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {myLessons.slice(0, 20).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.title}</p>
                  <p>Subject: {item.subject?.name ?? "-"} • Uploaded: {formatDate(item.createdAt)}</p>
                </div>
              ))}
              {!myLessons.length ? <p className="text-slate-500">No lesson notes published yet.</p> : null}
            </CardContent>
          </Card>
        );
      case "timetable":
        return (
          <Card>
            <CardHeader><CardTitle>Teaching Timetable</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {mySubjects.length ? mySubjects.map((item, idx) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">Period {idx + 1}: {item.name}</p>
                  <p>Class: {item.class?.name ?? "-"}</p>
                </div>
              )) : <p className="text-slate-500">No timetable data available.</p>}
            </CardContent>
          </Card>
        );
      case "student-reports":
        return (
          <Card>
            <CardHeader><CardTitle>Student Reports</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {myScores.slice(0, 25).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.student.user.name}</p>
                  <p>{item.subject.name} • Grade: {item.grade} • GPA: {item.gpa.toFixed(2)}</p>
                </div>
              ))}
              {!myScores.length ? <p className="text-slate-500">No report-ready scores yet.</p> : null}
            </CardContent>
          </Card>
        );
      case "lms":
        return (
          <div className="grid gap-3 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>LMS Lessons</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {myLessons.slice(0, 12).map((item) => <p key={item.id}>{item.title}</p>)}
                {!myLessons.length ? <p className="text-slate-500">No lesson content yet.</p> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>LMS Assignments</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {myAssignments.slice(0, 12).map((item) => <p key={item.id}>{item.title}</p>)}
                {!myAssignments.length ? <p className="text-slate-500">No assignments yet.</p> : null}
              </CardContent>
            </Card>
          </div>
        );
      case "announcements":
        return (
          <Card>
            <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {core.announcements.slice(0, 15).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-slate-600">{item.body.slice(0, 180)}</p>
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
      schoolLogoUrl={core.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Teacher"}
      pathname={`/teacher/${section}`}
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
        <CardHeader><CardTitle>{titles[canonical]}</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">{descriptions[canonical]}</CardContent>
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Classes</p><p className="text-xl font-semibold">{myClasses.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Subjects</p><p className="text-xl font-semibold">{mySubjects.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Scores</p><p className="text-xl font-semibold">{myScores.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Attendance Logs</p><p className="text-xl font-semibold">{myAttendance.length}</p></CardContent></Card>
      </section>

      {renderSection()}
    </PortalShell>
  );
}
