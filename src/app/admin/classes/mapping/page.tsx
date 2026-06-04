import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { ModernPortalShell } from "@/components/modern-portal-shell";
import { DashboardHeader } from "@/components/modern-dashboard";
import { ArmSubjectMappingManager } from "../../[section]/arm-subject-mapping";

export default async function ArmSubjectMappingPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile?.school?.name ?? "School"}
      schoolLogoUrl={profile?.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/classes/mapping"
    >
      <div className="space-y-6">
        <DashboardHeader 
          title="Arm Subject Mapping" 
          subtitle="Assign subjects to specific class arms and bind teachers to subject-arm combinations." 
        />
        <ArmSubjectMappingManager />
      </div>
    </ModernPortalShell>
  );
}
