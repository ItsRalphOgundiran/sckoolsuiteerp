import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { ModernPortalShell } from "@/components/modern-portal-shell";
import { DashboardHeader } from "@/components/modern-dashboard";
import { StudentSettingsClient } from "./student-settings-client";

export default async function StudentSettingsPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile?.school?.name ?? "School"}
      schoolLogoUrl={profile?.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/settings/students"
    >
      <div className="space-y-6">
        <DashboardHeader
          title="Student Settings"
          subtitle="Configure registration, attendance, transfers, and service request settings for students."
        />
        <StudentSettingsClient />
      </div>
    </ModernPortalShell>
  );
}
