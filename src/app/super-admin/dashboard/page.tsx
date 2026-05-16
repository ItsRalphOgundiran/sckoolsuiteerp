import { RoleDashboard } from "@/components/role-dashboard";

export default async function SuperAdminDashboardPage() {
  return <RoleDashboard roleScope="superadmin" pathname="/super-admin/dashboard" />;
}
