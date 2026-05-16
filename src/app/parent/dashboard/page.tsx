import { RoleDashboard } from "@/components/role-dashboard";

export default async function ParentDashboardPage() {
  return <RoleDashboard roleScope="parent" pathname="/parent/dashboard" />;
}
