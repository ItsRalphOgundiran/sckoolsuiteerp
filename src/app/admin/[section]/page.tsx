import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricGrid, SimpleTable } from "@/components/dashboard-kit";
import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth-guards";
import { getAdminOverview, getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext } from "@/lib/data";
import { adminModuleScopeBySection } from "@/lib/module-blueprint";
import { getActiveSchoolConfig } from "@/lib/school-config";
import { formatDate, naira } from "@/lib/utils";

const allowed = [
  "dashboard",
  "students",
  "reception",
  "parents",
  "teachers",
  "academics",
  "classes",
  "subjects",
  "fees",
  "finance",
  "invoices",
  "payments",
  "results",
  "lms",
  "attendance",
  "announcements",
  "transport",
  "settings",
] as const;

type AllowedSection = (typeof allowed)[number];

type AdminSectionBlueprint = {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string; helper?: string }>;
  actionChips: string[];
};

const blueprints: Record<AllowedSection, AdminSectionBlueprint> = {
  dashboard: {
    title: "Admin Command Center",
    subtitle: "School operations, academic control, and finance in one workspace.",
    metrics: [],
    actionChips: ["Admissions", "Classes", "Fees", "Results"],
  },
  students: {
    title: "Student Management",
    subtitle: "Admissions pipeline, records, promotions, discipline, and profile tracking.",
    metrics: [],
    actionChips: ["New Admission", "Bulk Promote", "Student Profile", "Export List"],
  },
  reception: {
    title: "Reception & Front Desk",
    subtitle: "New applicants, visitor intake, document checks, and parent follow-up.",
    metrics: [],
    actionChips: ["New Applicant", "Interview Queue", "Document Review", "Enrollment"],
  },
  parents: {
    title: "Parent Management",
    subtitle: "Parent records, communication, linked children, and account status.",
    metrics: [],
    actionChips: ["Parent Profiles", "Messages", "Complaints", "Payment Follow-up"],
  },
  teachers: {
    title: "Staff & Teacher Management",
    subtitle: "Teacher directory, permissions, class assignments, and workload control.",
    metrics: [],
    actionChips: ["Staff Directory", "Role Permissions", "Assignments", "Leave Review"],
  },
  academics: {
    title: "Academic Control",
    subtitle: "Sessions, terms, classes, arms, subjects, curriculum, and timetable planning.",
    metrics: [],
    actionChips: ["Session Setup", "Classes & Arms", "Subjects", "Timetable"],
  },
  classes: {
    title: "Class Builder",
    subtitle: "Create classes with arms and assign different subjects per arm.",
    metrics: [],
    actionChips: ["Add Class", "Add Arm", "Assign Subjects", "Promote Class"],
  },
  subjects: {
    title: "Subject Management",
    subtitle: "Allocate subjects by class and arm, then keep curriculum aligned.",
    metrics: [],
    actionChips: ["Add Subject", "Assign Teacher", "By Class", "By Arm"],
  },
  fees: {
    title: "Fee Setup",
    subtitle: "Fee groups, fee structures, concessions, and billing rules.",
    metrics: [],
    actionChips: ["Fee Group", "Structure", "Concession", "Invoice Rule"],
  },
  finance: {
    title: "Finance Management",
    subtitle: "Invoices, payments, receipts, debtors, discounts, and collections.",
    metrics: [],
    actionChips: ["Fee Setup", "Invoices", "Payments", "Debtors"],
  },
  invoices: {
    title: "Invoice Management",
    subtitle: "Generate bills, review balances, and track invoice status.",
    metrics: [],
    actionChips: ["Generate Invoice", "View Open", "Print Invoice", "Ledger Sync"],
  },
  payments: {
    title: "Payment Records",
    subtitle: "Confirm payments, reconcile channels, and monitor collections.",
    metrics: [],
    actionChips: ["Payment List", "Approve", "Reconcile", "Receipt Review"],
  },
  results: {
    title: "Result Engine",
    subtitle: "Assessment weights, grading bands, approvals, and report cards.",
    metrics: [],
    actionChips: ["Weight Setup", "Draft Results", "Publish", "Report Cards"],
  },
  lms: {
    title: "Learning Hub",
    subtitle: "Lessons, assignments, quizzes, and class content delivery.",
    metrics: [],
    actionChips: ["Lessons", "Assignments", "Quizzes", "Online Classes"],
  },
  attendance: {
    title: "Attendance Tracking",
    subtitle: "Daily attendance, punctuality, late records, and summaries.",
    metrics: [],
    actionChips: ["Take Attendance", "Attendance History", "Late Records", "Reports"],
  },
  announcements: {
    title: "Communication Hub",
    subtitle: "Announcements, broadcasts, events, and parent messages.",
    metrics: [],
    actionChips: ["Broadcast", "Event Notice", "Parent Message", "SMS/Email"],
  },
  transport: {
    title: "Transport & Driver",
    subtitle: "Bus routes, drivers, pickup planning, and transport readiness.",
    metrics: [],
    actionChips: ["Driver List", "Routes", "Pickup Stops", "Fleet Setup"],
  },
  settings: {
    title: "System Settings",
    subtitle: "Branding, calendar, configuration engine, and portal visibility.",
    metrics: [],
    actionChips: ["Configuration Engine", "Branding", "Academic Calendar", "Visibility"],
  },
};

function listToRows(items: Array<{ name: string; detail: string; status: string }>) {
  return items.map((item) => [item.name, item.detail, item.status]);
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return null;
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const [overview, core, activeConfig] = await Promise.all([
    getAdminOverview(profile.schoolId),
    getCoreSchoolDataByContext(profile.schoolId, { sessionId: context.session?.id, termId: context.term?.id }),
    getActiveSchoolConfig(profile.schoolId),
  ]);

  const blueprint = blueprints[section as AllowedSection];
  const academic = activeConfig.config.academic as {
    sessions: Array<{ name: string; status?: string }>;
    terms: Array<{ name: string; status?: string }>;
    classes: Array<{ name: string; arms?: Array<{ name: string; subjects?: string[] }> }>;
    subjects: Array<{ name: string; className?: string; armName?: string }>;
    assessmentTypes: Array<{ name: string; weight: number }>;
    gradingSystem: Array<{ min: number; grade: string; gpa: number }>;
  };
  const finance = activeConfig.config.finance as {
    feeStructures: Array<{ category: string; name: string; amount: number; className?: string; isActive?: boolean }>;
  };

  const metricsBySection: Record<AllowedSection, Array<{ label: string; value: string; helper?: string }>> = {
    dashboard: [
      { label: "Students", value: String(overview.students), helper: "Active school records" },
      { label: "Staff", value: String(overview.teachers), helper: "Teaching workforce" },
      { label: "Outstanding Fees", value: naira(overview.outstanding), helper: "Collections pending" },
      { label: "Attendance", value: String(overview.attendance), helper: "Logged attendance entries" },
    ],
    students: [
      { label: "Students", value: String(overview.students), helper: "Active learners" },
      { label: "Parents", value: String(overview.parents), helper: "Linked guardians" },
      { label: "Classes", value: String(overview.classes), helper: "Available placements" },
      { label: "Admission Flow", value: "Open", helper: "Applications can be reviewed" },
    ],
    reception: [
      { label: "Applications", value: String(core.students.length), helper: "Student records on file" },
      { label: "Parents", value: String(overview.parents), helper: "Guardians on file" },
      { label: "Pending Reviews", value: "0", helper: "Ready for intake review" },
      { label: "Documents", value: "Ready", helper: "Upload checks and verification" },
    ],
    parents: [
      { label: "Parents", value: String(overview.parents), helper: "Parent accounts" },
      { label: "Children", value: String(core.students.length), helper: "Linked children" },
      { label: "Messages", value: String(core.announcements.length), helper: "Announcements and alerts" },
      { label: "Bills", value: naira(overview.outstanding), helper: "Outstanding balances" },
    ],
    teachers: [
      { label: "Teachers", value: String(overview.teachers), helper: "Staff accounts" },
      { label: "Classes", value: String(overview.classes), helper: "Assigned class groups" },
      { label: "Subjects", value: String(core.subjects.length), helper: "Assigned subjects" },
      { label: "Pending Tasks", value: String(core.assignments.length), helper: "Content and grading tasks" },
    ],
    academics: [
      { label: "Sessions", value: String(academic.sessions.length), helper: "Academic sessions" },
      { label: "Terms", value: String(academic.terms.length), helper: "Term definitions" },
      { label: "Classes", value: String(academic.classes.length), helper: "Class groups and arms" },
      { label: "Subjects", value: String(academic.subjects.length), helper: "Curriculum subjects" },
    ],
    classes: [
      { label: "Classes", value: String(academic.classes.length), helper: "Configured class groups" },
      { label: "Arms", value: String(academic.classes.reduce((sum, item) => sum + (item.arms?.length ?? 0), 0)), helper: "Streams per class" },
      { label: "Subjects", value: String(academic.subjects.length), helper: "Subject assignments" },
      { label: "Current Session", value: context.session?.name ?? "-", helper: context.term?.name ?? "Active term" },
    ],
    subjects: [
      { label: "Subjects", value: String(academic.subjects.length), helper: "Defined subject list" },
      { label: "Class Links", value: String(academic.subjects.filter((item) => item.className).length), helper: "Class-specific allocations" },
      { label: "Arm Links", value: String(academic.subjects.filter((item) => item.armName).length), helper: "Arm-specific allocations" },
      { label: "Teachers", value: String(overview.teachers), helper: "Subject teachers available" },
    ],
    fees: [
      { label: "Fee Groups", value: String(finance.feeStructures.length), helper: "Configured billing rows" },
      { label: "Concessions", value: "Ready", helper: "Discount and waiver support" },
      { label: "Invoices", value: String(core.invoices.length), helper: "Generated billing records" },
      { label: "Outstanding", value: naira(overview.outstanding), helper: "Unpaid balances" },
    ],
    finance: [
      { label: "Invoices", value: String(core.invoices.length), helper: "Billing records" },
      { label: "Payments", value: String(core.payments.length), helper: "Payment entries" },
      { label: "Outstanding", value: naira(overview.outstanding), helper: "Balance due" },
      { label: "Fee Structures", value: String(finance.feeStructures.length), helper: "Dynamic fee setup" },
    ],
    invoices: [
      { label: "Invoices", value: String(core.invoices.length), helper: "Generated bills" },
      { label: "Paid", value: naira(overview.totalPaid), helper: "Collected value" },
      { label: "Outstanding", value: naira(overview.outstanding), helper: "Open balances" },
      { label: "Receipts", value: String(core.invoices.filter((item) => item.receipt).length), helper: "Issued proof of payment" },
    ],
    payments: [
      { label: "Payments", value: String(core.payments.length), helper: "Recorded collections" },
      { label: "Collected", value: naira(overview.totalPaid), helper: "Actual receipts" },
      { label: "Invoices", value: String(core.invoices.length), helper: "Billing queue" },
      { label: "Receipts", value: String(core.invoices.filter((item) => item.receipt).length), helper: "Validated payments" },
    ],
    results: [
      { label: "Assessment Types", value: String(academic.assessmentTypes.length), helper: "Weightable scoring blocks" },
      { label: "Grading Bands", value: String(academic.gradingSystem.length), helper: "Configured thresholds" },
      { label: "Scores", value: String(core.scores.length), helper: "Captured marks" },
      { label: "Reports", value: core.result ? "Draft" : "Pending", helper: "Current publication state" },
    ],
    lms: [
      { label: "Lessons", value: String(core.lessons.length), helper: "Lesson notes" },
      { label: "Assignments", value: String(core.assignments.length), helper: "Classwork items" },
      { label: "Quizzes", value: String(core.quizzes.length), helper: "CBT activities" },
      { label: "Online Classes", value: String(core.onlineClasses.length), helper: "Live sessions" },
    ],
    attendance: [
      { label: "Attendance", value: String(core.attendance.length), helper: "Logged entries" },
      { label: "Classes", value: String(overview.classes), helper: "Tracked groups" },
      { label: "Present", value: String(core.attendance.filter((item) => item.status === "PRESENT").length), helper: "Marked present" },
      { label: "Excused", value: String(core.attendance.filter((item) => item.status === "EXCUSED").length), helper: "Approved absences" },
    ],
    announcements: [
      { label: "Announcements", value: String(core.announcements.length), helper: "Broadcast posts" },
      { label: "Parents", value: String(overview.parents), helper: "Targeted recipients" },
      { label: "Teachers", value: String(overview.teachers), helper: "Staff recipients" },
      { label: "Students", value: String(overview.students), helper: "Learner recipients" },
    ],
    transport: [
      { label: "Routes", value: "Ready", helper: "Route planning bucket" },
      { label: "Drivers", value: "Ready", helper: "Driver roster bucket" },
      { label: "Pickup Stops", value: "Ready", helper: "Pickup allocation bucket" },
      { label: "Fleet", value: "Future", helper: "Transport module is scaffolded" },
    ],
    settings: [
      { label: "Config Versions", value: String(activeConfig.version), helper: activeConfig.source },
      { label: "Branding", value: profile.school.branding ? "Ready" : "Pending", helper: "Logo and colors" },
      { label: "Visibility", value: "On", helper: "Portal access rules" },
      { label: "Calendar", value: String(academic.sessions.length), helper: "Sessions configured" },
    ],
  };

  const metrics = metricsBySection[section as AllowedSection];
  const moduleScope = adminModuleScopeBySection[section] ?? {
    module: "Admin",
    submodules: [{ name: "General", screens: ["Overview"] }],
  };

  const classRows = academic.classes.map((item) => ({
    name: item.name,
    detail: `${item.arms?.length ?? 0} arm${(item.arms?.length ?? 0) === 1 ? "" : "s"}`,
    status: (item.arms?.length ?? 0) ? item.arms?.map((arm) => `${arm.name}: ${arm.subjects?.length ?? 0}`).join(" | ") ?? "No arms yet" : "No arms yet",
  }));

  const subjectRows = academic.subjects.map((item) => ({
    name: item.name,
    detail: [item.className, item.armName].filter(Boolean).join(" / ") || "Unassigned",
    status: "Subject allocation",
  }));

  const feeRows = finance.feeStructures.slice(0, 8).map((item) => ({
    name: item.name,
    detail: `${item.category} • ${naira(item.amount)}`,
    status: item.isActive === false ? "Inactive" : item.className ?? "Global",
  }));

  return (
    <PortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname={`/admin/${section}`}
      currentSessionName={context.session?.name}
      currentTermName={context.term?.name}
      sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
      terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
      selectedSessionId={context.session?.id}
      selectedTermId={context.term?.id}
      primaryColor={profile.school.branding?.primaryColor}
      secondaryColor={profile.school.branding?.secondaryColor}
    >
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{blueprint.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">{blueprint.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              {blueprint.actionChips.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <MetricGrid items={metrics} />

        <div className="grid gap-4 xl:grid-cols-2">
          <SimpleTable
            title={section === "classes" ? "Classes & Arms" : section === "subjects" ? "Subject Allocation" : section === "finance" || section === "fees" ? "Fee Structures" : "Operational Snapshot"}
            headers={["Name", "Detail", "Status"]}
            rows={section === "classes" ? listToRows(classRows) : section === "subjects" ? listToRows(subjectRows) : section === "finance" || section === "fees" ? listToRows(feeRows) : listToRows([
              { name: "Admissions", detail: "Review and enroll applicants", status: "Active" },
              { name: "Communication", detail: "Parent messages and alerts", status: "Ready" },
              { name: "Report Cards", detail: "Publish results and transcripts", status: "Ready" },
            ])}
          />

          <Card>
            <CardHeader>
              <CardTitle>{section === "classes" ? "Class Setup Notes" : section === "finance" || section === "fees" ? "Billing Notes" : section === "reception" ? "Admission Notes" : "Module Notes"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {section === "classes" ? (
                <>
                  <p>Each class can carry multiple arms such as A, B, and C.</p>
                  <p>Each arm can hold a different subject list so junior, senior, and mixed streams stay separate.</p>
                  <p className="text-xs text-slate-500">Current config ships {academic.classes.length} configured classes and {academic.subjects.length} subject links.</p>
                </>
              ) : section === "finance" || section === "fees" ? (
                <>
                  <p>Fee groups, concessions, and billing structure should live in one finance bundle.</p>
                  <p>Invoices and payment records should stay downstream from the fee engine.</p>
                  <p className="text-xs text-slate-500">Current outstanding balance: {naira(overview.outstanding)}.</p>
                </>
              ) : section === "reception" ? (
                <>
                  <p>Front desk should manage applicants, document checks, interviews, and enrollment conversion.</p>
                  <p>Reception should feed directly into student creation and class placement.</p>
                  <p className="text-xs text-slate-500">Use the admissions flow before moving any applicant into billing.</p>
                </>
              ) : section === "settings" ? (
                <>
                  <p>The configuration engine should be the single place for sessions, terms, classes, arms, subjects, fees, and visibility rules.</p>
                  <p>Branding, calendar, and portal controls should stay adjacent to the engine.</p>
                  <p className="text-xs text-slate-500">Open the Dynamic Configuration Engine for versioned school setup.</p>
                </>
              ) : (
                <>
                  <p>This section is now part of a bundled module model instead of a flat generic screen.</p>
                  <p>Use the sidebar to jump between operational bundles and keep the page focused on one school workflow.</p>
                  <p className="text-xs text-slate-500">Current term: {context.term?.name ?? "-"} • Updated {formatDate(new Date())}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{moduleScope.module} Module Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-2">Submodule</th>
                    <th className="px-2 py-2">Screens</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleScope.submodules.map((item) => (
                    <tr key={`${section}-${item.name}`} className="border-b border-slate-100">
                      <td className="px-2 py-2 font-medium text-slate-800">{item.name}</td>
                      <td className="px-2 py-2 text-slate-600">{item.screens.join(" • ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </PortalShell>
  );
}
