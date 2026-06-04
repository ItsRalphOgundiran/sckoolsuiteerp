import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { ModernPortalShell } from "@/components/modern-portal-shell";
import { DashboardHeader } from "@/components/modern-dashboard";
import { SimpleSetupClient } from "./simple-setup-client";

export default async function AdminSetupWizardPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return null;
  }

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/setup"
    >
      <div className="space-y-6">
        <DashboardHeader 
          title="School Setup" 
          subtitle="Complete your school profile and academic session setup to activate your school. All other configurations can be done in Settings after activation." 
        />
        <SimpleSetupClient />
      </div>
    </ModernPortalShell>
  );
}
