export const APP_NAME = "Sckool Suite";
export const APP_POWERED_BY = "Powered by Sckool Suite";

export const demoCredentials = [
  { role: "Admin", email: "admin@sckoolsuite.com", password: "password123" },
  { role: "Principal", email: "principal@sckoolsuite.com", password: "password123" },
  { role: "Accountant", email: "accountant@sckoolsuite.com", password: "password123" },
  { role: "Teacher", email: "teacher@sckoolsuite.com", password: "password123" },
  { role: "Parent", email: "parent@sckoolsuite.com", password: "password123" },
  { role: "Student", email: "student@sckoolsuite.com", password: "password123" },
  { role: "Super Admin", email: "superadmin@sckoolsuite.com", password: "password123" },
] as const;

export const roleDefaultRoute: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  SCHOOL_ADMIN: "/admin/dashboard",
  PRINCIPAL: "/admin/dashboard",
  ACCOUNTANT: "/accountant/dashboard",
  REGISTRAR: "/registrar/dashboard",
  TEACHER: "/teacher/dashboard",
  PARENT: "/parent/dashboard",
  STUDENT: "/student/dashboard",
};
