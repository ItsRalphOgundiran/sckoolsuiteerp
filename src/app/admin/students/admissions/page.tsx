import { requireRole } from "@/lib/auth-guards";
import { getCurrentSchoolByUser } from "@/lib/data";
import { ModernPortalShell } from "@/components/modern-portal-shell";
import { DashboardHeader } from "@/components/modern-dashboard";
import { FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AdmissionsPage() {
  const user = await requireRole(["SCHOOL_ADMIN", "PRINCIPAL"]);
  const profile = await getCurrentSchoolByUser(user.id);

  return (
    <ModernPortalShell
      role={user.role}
      schoolName={profile?.school?.name ?? "School"}
      schoolLogoUrl={profile?.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Admin"}
      pathname="/admin/students/admissions"
    >
      <div className="space-y-6">
        <DashboardHeader
          title="Student Admissions"
          subtitle="Manage provisional and final student admissions"
        />
        
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-amber-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Admissions Module
            </h3>
            <p className="text-slate-500 max-w-md mb-4">
              This module manages provisional student admissions and the admission workflow. 
              Configure admission settings in{" "}
              <Link 
                href="/admin/settings/students" 
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Student Settings
              </Link>.
            </p>
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Feature under development - Settings available now</span>
            </div>
          </div>
        </div>
      </div>
    </ModernPortalShell>
  );
}
