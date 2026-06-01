import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { getActiveSchoolConfig, getSchoolConfigVersions } from "@/lib/school-config";
import { ConfigEngineClient } from "@/app/admin/settings/config-engine/config-engine-client";

export default async function ConfigEnginePage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);

  if (!profile?.schoolId || !profile?.school) {
    return (
      <SetupRequiredScreen
        title="School Profile Missing"
        message="Your admin account is not linked to a school yet. Complete school setup to configure dynamic academic and billing logic."
        actionHref="/create-account"
        actionLabel="Open School Setup"
      />
    );
  }

  const [active, versions] = await Promise.all([
    getActiveSchoolConfig(profile.schoolId),
    getSchoolConfigVersions(profile.schoolId),
  ]);

  return (
    <PortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/settings/config-engine"
      primaryColor={profile.school.branding?.primaryColor}
      secondaryColor={profile.school.branding?.secondaryColor}
    >
      <Card>
        <CardHeader>
          <CardTitle>Configuration Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigEngineClient
            initialActive={{
              id: active.id,
              version: active.version,
              source: active.source,
              notes: active.notes,
              config: active.config,
            }}
            initialVersions={versions.map((item) => ({
              id: item.id,
              version: item.version,
              isActive: item.isActive,
              source: item.source,
              notes: item.notes,
              createdAt: item.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
