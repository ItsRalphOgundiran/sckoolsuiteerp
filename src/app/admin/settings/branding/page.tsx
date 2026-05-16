import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { BrandingForm } from "@/app/admin/settings/branding/branding-form";

export default async function BrandingSettingsPage() {
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
      pathname="/admin/settings/branding"
      primaryColor={profile.school.branding?.primaryColor}
      secondaryColor={profile.school.branding?.secondaryColor}
    >
      <Card>
        <CardHeader>
          <CardTitle>School Branding & Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandingForm
            defaults={{
              schoolName: profile.school.name,
              address: profile.school.address,
              email: profile.school.email,
              phone: profile.school.phone,
              website: profile.school.website ?? "",
              motto: profile.school.motto ?? "",
              logoUrl: profile.school.branding?.logoUrl ?? "",
              primaryColor: profile.school.branding?.primaryColor ?? "#0B1F4D",
              secondaryColor: profile.school.branding?.secondaryColor ?? "#0E9F6E",
              reportCardTheme: profile.school.branding?.reportCardTheme ?? "classic",
              invoiceTheme: profile.school.branding?.invoiceTheme ?? "clean",
              receiptTheme: profile.school.branding?.receiptTheme ?? "simple",
              bankName: profile.school.branding?.bankName ?? "",
              bankAccountName: profile.school.branding?.bankAccountName ?? "",
              bankAccountNumber: profile.school.branding?.bankAccountNumber ?? "",
              bankInstructions: profile.school.branding?.bankInstructions ?? "",
              principalSignature: profile.school.branding?.principalSignature ?? "",
              teacherSignature: profile.school.branding?.teacherSignature ?? "",
              schoolStamp: profile.school.branding?.schoolStamp ?? "",
            }}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
