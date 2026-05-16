import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { prisma } from "@/lib/prisma";
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

  const [sessions, terms] = await Promise.all([
    prisma.session.findMany({
      where: { schoolId: profile.school.id },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.term.findMany({
      where: { schoolId: profile.school.id },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  const initialSessions = sessions.map((item) => ({
    id: item.id,
    name: item.name,
    isCurrent: item.isCurrent,
    status: item.status,
    startDate: item.startDate?.toISOString() ?? null,
    endDate: item.endDate?.toISOString() ?? null,
  }));

  const initialTerms = terms.map((item) => ({
    id: item.id,
    name: item.name,
    isCurrent: item.isCurrent,
    status: item.status,
    sessionId: item.sessionId,
    startDate: item.startDate?.toISOString() ?? null,
    endDate: item.endDate?.toISOString() ?? null,
    resumptionDate: item.resumptionDate?.toISOString() ?? null,
  }));

  const activeSession = sessions.find((item) => item.isCurrent);
  const activeTerm = terms.find((item) => item.isCurrent);

  return (
    <PortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl ?? undefined}
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
          <AcademicCalendarClient
            initialSessions={initialSessions}
            initialTerms={initialTerms}
            initialSessionId={activeSession?.id}
            initialTermId={activeTerm?.id}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
