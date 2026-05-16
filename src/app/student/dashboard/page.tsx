import { RoleDashboard } from "@/components/role-dashboard";

export default async function StudentDashboardPage() {
  return <RoleDashboard roleScope="student" pathname="/student/dashboard" />;
}
