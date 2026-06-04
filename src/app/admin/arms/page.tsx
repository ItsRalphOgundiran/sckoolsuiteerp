import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { ModernPortalShell } from "@/components/modern-portal-shell";
import { DashboardHeader } from "@/components/modern-dashboard";
import { ArmsManager } from "../[section]/arms-manager";

export default async function ArmsPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile?.school?.name ?? "School"}
      schoolLogoUrl={profile?.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/arms"
    >
      <div className="space-y-6">
        <DashboardHeader 
          title="Class Arms Management" 
          subtitle="Create and manage class arms (A, B, C, etc.) and assign them to classes." 
        />
        <ArmsManager />
      </div>
    </ModernPortalShell>
  );
}
