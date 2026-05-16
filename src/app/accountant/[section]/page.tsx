import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { SetupRequiredScreen } from "@/components/setup-required-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guards";
import { getCoreSchoolDataByContext, getCurrentSchoolByUser, getUserAcademicContext, statusLabel } from "@/lib/data";
import { formatDate, naira } from "@/lib/utils";

const allowed = ["fee-setup", "invoices", "payments", "receipts", "debtors", "discounts", "finance-reports", "fees"] as const;
type AllowedSection = (typeof allowed)[number];

const aliases: Record<AllowedSection, Exclude<AllowedSection, "fees">> = {
  "fee-setup": "fee-setup",
  invoices: "invoices",
  payments: "payments",
  receipts: "receipts",
  debtors: "debtors",
  discounts: "discounts",
  "finance-reports": "finance-reports",
  fees: "fee-setup",
};

const titles: Record<Exclude<AllowedSection, "fees">, string> = {
  "fee-setup": "Fee Setup",
  invoices: "Invoices",
  payments: "Payments",
  receipts: "Receipts",
  debtors: "Debtors",
  discounts: "Discounts",
  "finance-reports": "Finance Reports",
};

const descriptions: Record<Exclude<AllowedSection, "fees">, string> = {
  "fee-setup": "Configure fee items and billing structure.",
  invoices: "Generate and monitor invoice lifecycle.",
  payments: "Review collected, pending, and channel split payments.",
  receipts: "Audit issued receipts and proof of payment records.",
  debtors: "Track outstanding balances and follow-up priority.",
  discounts: "Manage discounts and partial payment adjustments.",
  "finance-reports": "View financial performance and collection insights.",
};

export default async function AccountantSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(allowed as readonly string[]).includes(section)) notFound();

  const user = await requireRole(["ACCOUNTANT"]);
  const profile = await getCurrentSchoolByUser(user.id);
  if (!profile?.schoolId || !profile.school) {
    return (
      <SetupRequiredScreen
        title="Account Setup Incomplete"
        message="Your accountant account is not linked to a school yet. Please contact the school admin to complete your profile linkage."
      />
    );
  }

  const context = await getUserAcademicContext(profile.schoolId, user.id);
  const core = await getCoreSchoolDataByContext(profile.schoolId, {
    sessionId: context.session?.id,
    termId: context.term?.id,
  });

  const totalInvoiced = core.invoices.reduce((sum: number, item: { totalAmount?: number }) => sum + (item.totalAmount || 0), 0 as number);
  const totalPaid = core.payments.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0 as number);
  const outstanding = core.invoices.reduce((sum: number, item: { balance?: number }) => sum + (item.balance || 0), 0 as number);
  const debtors = core.invoices.filter((item: { balance: number }) => item.balance > 0);
  const canonical = aliases[section as AllowedSection];

  function renderSection() {
    switch (canonical) {
      case "fee-setup":
        return (
          <Card>
            <CardHeader><CardTitle>Fee Setup</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
               {core.feeItems.length ? core.feeItems.map((item: { id: string; name: string; amount: number; class?: { name: string } }) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.name}</p>
                  <p>Amount: {naira(item.amount)} • Class: {item.class?.name ?? "All"}</p>
                </div>
              )) : <p className="text-slate-500">No fee items configured yet.</p>}
            </CardContent>
          </Card>
        );
      case "invoices":
        return (
          <Card>
            <CardHeader><CardTitle>Invoice Ledger</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                {core.invoices.slice(0, 30).map((item: any) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.invoiceNumber}</p>
                  <p>{item.student.user.name} • Total: {naira(item.totalAmount)} • Balance: {naira(item.balance)}</p>
                  <p>Status: {statusLabel(item.status)} • Due: {formatDate(item.dueDate)}</p>
                </div>
              ))}
              {!core.invoices.length ? <p className="text-slate-500">No invoices generated yet.</p> : null}
            </CardContent>
          </Card>
        );
      case "payments":
        return (
          <Card>
            <CardHeader><CardTitle>Payment Activity</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                {core.payments.slice(0, 30).map((item: any) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.invoice?.invoiceNumber ?? `Payment ${item.id.slice(0, 8)}`}</p>
                  <p>{naira(item.amount)} via {item.method}</p>
                  <p>Status: {statusLabel(item.status)} • Date: {formatDate(item.createdAt)}</p>
                </div>
              ))}
              {!core.payments.length ? <p className="text-slate-500">No payment records available.</p> : null}
            </CardContent>
          </Card>
        );
      case "receipts":
        return (
          <Card>
            <CardHeader><CardTitle>Issued Receipts</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                {core.invoices.filter((item: any) => item.receipt).slice(0, 30).map((item: any) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.invoiceNumber}</p>
                  <p>Student: {item.student.user.name} • Paid: {naira(item.amountPaid)}</p>
                  <p>Receipt issued</p>
                </div>
              ))}
              {!core.invoices.some((item) => item.receipt) ? <p className="text-slate-500">No receipts issued yet.</p> : null}
            </CardContent>
          </Card>
        );
      case "debtors":
        return (
          <Card>
            <CardHeader><CardTitle>Debtors</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                {debtors.slice(0, 30).map((item: any) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.student.user.name}</p>
                  <p>Invoice: {item.invoiceNumber} • Outstanding: {naira(item.balance)}</p>
                </div>
              ))}
              {!debtors.length ? <p className="text-slate-500">No debtors at the moment.</p> : null}
            </CardContent>
          </Card>
        );
      case "discounts":
        return (
          <Card>
            <CardHeader><CardTitle>Discounts & Adjustments</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Track invoices with partial payments as active discount/adjustment indicators.</p>
              {core.invoices.filter((item) => item.status === "PART_PAYMENT").slice(0, 25).map((item) => (
                <div key={item.id} className="glass-soft rounded-xl p-3">
                  <p className="font-medium">{item.invoiceNumber}</p>
                  <p>Paid: {naira(item.amountPaid)} • Balance: {naira(item.balance)}</p>
                </div>
              ))}
              {!core.invoices.some((item) => item.status === "PART_PAYMENT") ? <p className="text-slate-500">No partial-payment adjustments found.</p> : null}
            </CardContent>
          </Card>
        );
      case "finance-reports":
        return (
          <div className="grid gap-3 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Collection Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Total Invoiced: {naira(totalInvoiced)}</p>
                <p>Total Collected: {naira(totalPaid)}</p>
                <p>Total Outstanding: {naira(outstanding)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Payment Channels</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {Array.from(new Set(core.payments.map((item) => item.method))).map((method) => (
                  <p key={method}>{method}: {core.payments.filter((item) => item.method === method).length} txns</p>
                ))}
                {!core.payments.length ? <p className="text-slate-500">No channel records yet.</p> : null}
              </CardContent>
            </Card>
          </div>
        );
    }
  }

  return (
    <PortalShell
      role={user.role}
      schoolName={core.school?.name}
      schoolLogoUrl={core.school?.branding?.logoUrl ?? undefined}
      userName={user.name ?? "Accountant"}
      pathname={`/accountant/${section}`}
      currentSessionName={context.session?.name}
      currentTermName={context.term?.name}
      sessions={core.sessions.map((item) => ({ id: item.id, name: item.name }))}
      terms={core.terms.map((item) => ({ id: item.id, name: item.name, sessionId: item.sessionId }))}
      selectedSessionId={context.session?.id}
      selectedTermId={context.term?.id}
      primaryColor={core.school?.branding?.primaryColor}
      secondaryColor={core.school?.branding?.secondaryColor}
    >
      <Card>
        <CardHeader><CardTitle>{titles[canonical]}</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">{descriptions[canonical]}</CardContent>
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Expected Revenue</p><p className="text-xl font-semibold">{naira(totalInvoiced)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Collected</p><p className="text-xl font-semibold">{naira(totalPaid)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Outstanding</p><p className="text-xl font-semibold">{naira(outstanding)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Debtor Invoices</p><p className="text-xl font-semibold">{debtors.length}</p></CardContent></Card>
      </section>

      {renderSection()}
    </PortalShell>
  );
}
