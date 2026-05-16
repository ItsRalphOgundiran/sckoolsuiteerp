import { notFound } from "next/navigation";
import { PortalPage } from "@/components/portal-page";

const allowed = [
  "students",
  "parents",
  "teachers",
  "classes",
  "subjects",
  "fees",
  "invoices",
  "payments",
  "results",
  "lms",
  "attendance",
  "announcements",
  "settings",
] as const;

const titles: Record<(typeof allowed)[number], string> = {
  students: "Student Management",
  parents: "Parent Management",
  teachers: "Teacher Management",
  classes: "Class Management",
  subjects: "Subject Management",
  fees: "Fees Module",
  invoices: "Invoices",
  payments: "Payments",
  results: "Result Engine",
  lms: "LMS Manager",
  attendance: "Attendance Tracker",
  announcements: "Announcements",
  settings: "School Settings",
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  return <PortalPage roleScope="admin" pathname={`/admin/${section}`} title={titles[section as (typeof allowed)[number]]} />;
}
