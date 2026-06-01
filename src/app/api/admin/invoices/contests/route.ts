import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listInvoiceContestsBySchool } from "@/lib/invoice-contest";

export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.schoolId || !user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = ["SUPER_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "ACCOUNTANT"];
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contests = await listInvoiceContestsBySchool(user.schoolId, 100);
  const invoiceIds = contests.map((item) => item.invoiceId);
  const audits = invoiceIds.length
    ? await (await import("@/lib/prisma")).prisma.invoiceContestAudit.findMany({
        where: { schoolId: user.schoolId, invoiceId: { in: invoiceIds } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return NextResponse.json({ contests, audits });
}
