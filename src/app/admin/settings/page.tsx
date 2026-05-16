import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";

export default async function SettingsPage() {
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
      pathname="/admin/settings"
      primaryColor={profile.school.branding?.primaryColor}
      secondaryColor={profile.school.branding?.secondaryColor}
    >
      <Card>
        <CardHeader>
          <CardTitle>School Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Link href="/admin/settings/branding" className="glass-soft rounded-xl p-4 text-sm text-slate-700 hover:bg-white">
            Branding & Print Templates
          </Link>
          <Link href="/admin/settings/academic-calendar" className="glass-soft rounded-xl p-4 text-sm text-slate-700 hover:bg-white">
            Academic Calendar & Session Control
          </Link>
        </CardContent>
      </Card>
    </PortalShell>
  );
}
