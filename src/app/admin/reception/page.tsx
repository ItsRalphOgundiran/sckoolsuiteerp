import { ModernPortalShell } from "@/components/modern-portal-shell";
import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { VisitorClient } from "./visitor-client";

export default async function ReceptionPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL", "RECEPTIONIST"]);
  const profile = await getCurrentSchoolByUser(user.id);

  if (!profile?.school) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          School profile required. Please complete setup first.
        </div>
      </div>
    );
  }

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile.school.name}
      schoolLogoUrl={profile.school.branding?.logoUrl || undefined}
      userName={user.name || "Admin"}
      pathname="/admin/reception"
    >
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Visitor Management</h1>
          <p className="text-slate-600 mt-1">Track visitors, check-ins, and generate reports</p>
        </div>
        <VisitorClient schoolId={profile.schoolId} />
      </div>
    </ModernPortalShell>
  );
}
