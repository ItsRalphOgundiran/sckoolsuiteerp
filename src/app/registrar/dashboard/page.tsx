import { RoleDashboard } from "@/components/role-dashboard";

export default async function RegistrarDashboardPage() {
  return <RoleDashboard roleScope="registrar" pathname="/registrar/dashboard" />;
}
