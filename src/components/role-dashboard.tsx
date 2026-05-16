import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { DashboardDataTable } from "@/components/dashboard-data-table";
import {
  ActivityFeed,
  AnnouncementWidget,
  DashboardHero,
  DashboardQuickActions,
  DashboardSeries,
  DashboardStatCards,
  TaskWidget,
} from "@/components/dashboard-widgets";
import { requireRole } from "@/lib/auth-guards";
import { getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext } from "@/lib/data";
import { buildSchoolRoleModel, buildSuperAdminModel, type RoleScope } from "@/lib/dashboard/role-dashboard-model";
import { prisma } from "@/lib/prisma";

const roleAliases: Record<RoleScope, string[]> = {
  superadmin: ["SUPER_ADMIN"],
  admin: ["SCHOOL_ADMIN", "PRINCIPAL"],
  teacher: ["TEACHER"],
  accountant: ["ACCOUNTANT"],
  parent: ["PARENT"],
  student: ["STUDENT"],
  registrar: ["REGISTRAR"],
};

export async function RoleDashboard({ roleScope, pathname }: { roleScope: RoleScope; pathname: string }) {
  const user = await requireRole(roleAliases[roleScope]);

  if (roleScope === "superadmin") {
    const schools = await prisma.school.findMany({
      include: {
        users: true,
        students: true,
        teachers: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const model = buildSuperAdminModel({
      schools,
      totalRevenue: schools.reduce((sum, school) => sum + school.payments.reduce((acc, payment) => acc + payment.amount, 0), 0),
      totalTeachers: schools.reduce((sum, school) => sum + school.teachers.length, 0),
      totalStudents: schools.reduce((sum, school) => sum + school.students.length, 0),
    });

    return (
      <PortalShell role={user.role} userName={user.name ?? "Super Admin"} pathname={pathname}>
        <DashboardHero title={model.title} subtitle={model.subtitle} />
        <DashboardStatCards items={model.stats} />

        <section className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
          <DashboardSeries title={model.series.title} subtitle={model.series.subtitle} data={model.series.data} />
          <DashboardQuickActions items={model.quickActions} />
        </section>

        <section className="grid gap-3 xl:grid-cols-[1.25fr_1fr_1fr]">
          <DashboardDataTable title={model.tableTitle} rows={model.tableRows} emptyMessage="No schools onboarded yet." />
          <ActivityFeed title="Recent Platform Activities" items={model.activities} />
          <TaskWidget items={model.tasks} />
        </section>

        <AnnouncementWidget items={model.announcements} />
      </PortalShell>
    );
  }

  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId) {
    return (
      <SetupRequiredScreen
        title="Session Out Of Sync"
        message="Your account session is active, but your user record could not be found or is not linked to a school. Please sign out and log in again."
        actionHref="/login"
        actionLabel="Sign in again"
        actionMode="signout"
      />
    );
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const core = await getCoreSchoolDataByContext(profile.schoolId, {
    sessionId: context.session?.id,
    termId: context.term?.id,
  });

  const model = buildSchoolRoleModel(roleScope as Exclude<RoleScope, "superadmin">, core);

  return (
    <PortalShell
      role={user.role}
      schoolName={core.school?.name}
      schoolLogoUrl={core.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "User"}
      pathname={pathname}
      currentSessionName={context.session?.name}
      currentTermName={context.term?.name}
      sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
      terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
      selectedSessionId={context.session?.id}
      selectedTermId={context.term?.id}
      primaryColor={core.school?.branding?.primaryColor}
      secondaryColor={core.school?.branding?.secondaryColor}
    >
      <DashboardHero title={model.title} subtitle={model.subtitle} />
      <DashboardStatCards items={model.stats} />

      <section className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <DashboardSeries title={model.series.title} subtitle={model.series.subtitle} data={model.series.data} />
        <DashboardQuickActions items={model.quickActions} />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.25fr_1fr_1fr]">
        <DashboardDataTable title={model.tableTitle} rows={model.tableRows} emptyMessage="No records found for this context." />
        <ActivityFeed title="Recent Activities" items={model.activities} />
        <TaskWidget items={model.tasks} />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.3fr_1fr]">
        <AnnouncementWidget items={model.announcements} />
        <section className="glass-panel rounded-2xl p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Role Modules</h3>
          <div className="grid grid-cols-2 gap-2">
            {model.modules.map((module) => (
              <div key={module} className="glass-soft rounded-xl px-3 py-2 text-sm text-slate-700">
                {module}
              </div>
            ))}
          </div>
        </section>
      </section>
    </PortalShell>
  );
}
