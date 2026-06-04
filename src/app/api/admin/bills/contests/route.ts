import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listBillContestsBySchool } from "@/lib/bill-contest";

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

  const contests = await listBillContestsBySchool(user.schoolId, 100);
  const billIds = contests.map((item) => item.invoiceId);
  const audits = billIds.length
    ? await (await import("@/lib/prisma")).prisma.invoiceContestAudit.findMany({
        where: { schoolId: user.schoolId, invoiceId: { in: billIds } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return NextResponse.json({ contests, audits });
}
