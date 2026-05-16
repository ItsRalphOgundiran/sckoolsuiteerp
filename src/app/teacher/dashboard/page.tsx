import { RoleDashboard } from "@/components/role-dashboard";

export default async function TeacherDashboardPage() {
  return <RoleDashboard roleScope="teacher" pathname="/teacher/dashboard" />;
}
