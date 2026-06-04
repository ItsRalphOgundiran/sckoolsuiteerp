import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SetupWizard } from "./setup-wizard";

export default async function SetupPage() {
  // Check if setup is already complete (school exists and is active with a user)
  const existingSchool = await prisma.school.findFirst();
  const existingAdmin = await prisma.user.findFirst({
    where: { role: { name: "SCHOOL_ADMIN" } }
  });

  // If school exists with an admin, setup is complete - redirect to login
  if (existingSchool && existingAdmin) {
    redirect("/login");
  }

  // Check setup progress
  const hasSession = existingSchool ? await prisma.session.findFirst({ where: { schoolId: existingSchool.id } }) : null;
  const hasTerm = existingSchool && hasSession ? await prisma.term.findFirst({ where: { schoolId: existingSchool.id } }) : null;

  // Determine starting step
  let step = 1;
  if (existingSchool) step = 2;
  if (hasSession) step = 3;
  if (hasTerm) step = 4;

  return <SetupWizard 
    existingSchool={existingSchool} 
    step={step}
    existingSession={hasSession}
    existingTerm={hasTerm}
  />;
}
