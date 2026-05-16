import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { AcademicCalendarClient } from "@/app/admin/settings/academic-calendar/academic-calendar-client";

export default async function AcademicCalendarPage() {
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
    <PortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl}
      userName={user.name ?? "Admin"}
      pathname="/admin/settings/academic-calendar"
      primaryColor={profile.school.branding?.primaryColor}
      secondaryColor={profile.school.branding?.secondaryColor}
    >
      <Card>
        <CardHeader>
          <CardTitle>Academic Calendar & Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicCalendarClient />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
