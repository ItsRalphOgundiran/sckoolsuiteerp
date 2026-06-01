import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth-guards";
import { getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext } from "@/lib/data";
import { SetupWizardClient } from "./setup-wizard-client";

export default async function AdminSetupWizardPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return null;
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const core = await getCoreSchoolDataByContext(profile.schoolId, { sessionId: context.session?.id, termId: context.term?.id });

  return (
    <PortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/setup"
      currentSessionName={context.session?.name}
      currentTermName={context.term?.name}
      sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
      terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
      selectedSessionId={context.session?.id}
      selectedTermId={context.term?.id}
      primaryColor={profile.school.branding?.primaryColor}
      secondaryColor={profile.school.branding?.secondaryColor}
    >
      <SetupWizardClient />
    </PortalShell>
  );
}
