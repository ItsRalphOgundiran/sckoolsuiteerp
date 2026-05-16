import { notFound } from "next/navigation";
import { PortalPage } from "@/components/portal-page";

const allowed = ["applications", "admissions", "student-records", "class-placement", "parent-records", "documents", "id-cards"] as const;

const titles: Record<(typeof allowed)[number], string> = {
  applications: "New Applications",
  admissions: "Admissions Queue",
  "student-records": "Student Records",
  "class-placement": "Class Placement",
  "parent-records": "Parent Records",
  documents: "Documents",
  "id-cards": "ID Card Management",
};

export default async function RegistrarSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  return <PortalPage roleScope="registrar" pathname={`/registrar/${section}`} title={titles[section as (typeof allowed)[number]]} />;
}
