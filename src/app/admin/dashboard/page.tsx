import { RoleDashboard } from "@/components/role-dashboard";

export default async function AdminDashboardPage() {
  return <RoleDashboard roleScope="admin" pathname="/admin/dashboard" />;
}
