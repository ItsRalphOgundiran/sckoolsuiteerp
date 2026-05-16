import { RoleDashboard } from "@/components/role-dashboard";

export default async function AccountantDashboardPage() {
  return <RoleDashboard roleScope="accountant" pathname="/accountant/dashboard" />;
}
