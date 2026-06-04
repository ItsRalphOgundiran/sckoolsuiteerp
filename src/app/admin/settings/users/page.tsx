import { ModernPortalShell } from "@/components/modern-portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { DashboardHeader } from "@/components/modern-dashboard";

export default async function UsersRolesPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);

  if (!profile?.school) {
    return (
      <SetupRequiredScreen
        title="School Profile Missing"
        message="Your admin account does not have a school profile yet. Please complete school setup first."
        actionHref="/create-account"
        actionLabel="Open School Setup"
      />
    );
  }

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/settings/users"
    >
      <div className="space-y-6">
        <DashboardHeader
          title="Users & Roles"
          subtitle="Manage user accounts, permissions, and role assignments."
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500">Configure user roles and access permissions</p>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
              <p className="text-sm text-slate-600">
                User & Roles management is under development.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                This feature will allow you to manage admin users, teachers, and their permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModernPortalShell>
  );
}
