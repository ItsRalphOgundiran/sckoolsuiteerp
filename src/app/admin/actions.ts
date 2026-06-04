"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";

export async function assignSchoolToUser(schoolId: string) {
  const user = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { schoolId },
  });
  
  revalidatePath("/admin/dashboard");
  return { success: true };
}
