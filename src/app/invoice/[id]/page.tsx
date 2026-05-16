import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { APP_POWERED_BY } from "@/lib/constants";
import { formatDate, naira } from "@/lib/utils";
import { statusLabel } from "@/lib/data";
import { PrintButton } from "@/components/print-button";

const coreOrder = [
  "Tuition",
  "Stationery & Utility",
  "Examination",
  "PTF",
  "Music",
  "ICT",
  "Chess",
  "Etiquette",
  "Diction and Elocution",
  "Creative Arts",
  "Medical",
  "Excursion",
  "Activity Week",
  "First School Leaving Certificate (FSLC)",
];

const optionalOrder = [
  "Lunch",
  "After School Care/Lesson",
  "Taekwondo",
  "School Bus",
  "Football Academy",
  "Ballet",
  "Textbooks",
];

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      school: { include: { branding: true } },
      student: { include: { user: true, class: true } },
      parent: { include: { user: true } },
      term: true,
      session: true,
      items: { include: { feeItem: true } },
    },
  });

  if (!invoice) notFound();

  const classFeeItems = await prisma.feeItem.findMany({
    where: {
      schoolId: invoice.schoolId,
      OR: invoice.classId ? [{ classId: invoice.classId }, { classId: null }] : [{ classId: null }],
    },
  });

  const templateFeeItems = classFeeItems.length
    ? classFeeItems
    : invoice.items.map((item) => ({
        id: item.feeItem.id,
        schoolId: invoice.schoolId,
        classId: invoice.classId,
        category: item.feeItem.category,
        name: item.feeItem.name,
        amount: item.amount,
        isActive: true,
        createdAt: new Date(),
      }));

  const invoicedAmountByName = new Map(invoice.items.map((item) => [item.feeItem.name, item.amount]));
  const feeByName = new Map(templateFeeItems.map((item) => [item.name, item]));

  const coreRows = coreOrder.map((name) => ({ name, amount: feeByName.get(name)?.amount ?? 0 }));
  const optionalRows = optionalOrder.map((name) => ({ name, amount: feeByName.get(name)?.amount ?? 0 }));

  const coreSubtotal = coreRows.reduce((sum, row) => sum + row.amount, 0);
  const optionalSubtotal = optionalRows.reduce((sum, row) => sum + row.amount, 0);

  const ruleText = invoice.paymentInstructions ?? invoice.school.branding?.bankInstructions ?? "";
  const paymentRules = ruleText
    .split(/\s(?=\d+\.)/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="p-4">
      <div className="no-print mx-auto mb-3 flex max-w-[210mm] justify-end">
        <PrintButton />
      </div>
      <div className="print-sheet rounded-lg border border-slate-200 p-6 text-slate-900 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Invoice</p>
            <h1 className="text-2xl font-semibold">{invoice.school.name}</h1>
            <p>{invoice.school.address}</p>
            <p>{invoice.school.email} | {invoice.school.phone}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{invoice.invoiceNumber}</p>
            <p>Session: {invoice.session.name}</p>
            <p>Term: {invoice.term.name}</p>
            <p>Status: {statusLabel(invoice.status)}</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="font-semibold">Student</p>
            <p>{invoice.student.user.name}</p>
            <p>{invoice.student.class?.name ?? "-"}</p>
          </div>
          <div>
            <p className="font-semibold">Parent</p>
            <p>{invoice.parent?.user.name ?? "-"}</p>
            <p>Due: {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</p>
          </div>
        </div>

        <table className="mb-4 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border p-2">Fee Item</th>
              <th className="border p-2">Category</th>
              <th className="border p-2 text-right">NGN</th>
            </tr>
          </thead>
          <tbody>
            {coreRows.map((row) => (
              <tr key={`core-${row.name}`}>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">Core</td>
                <td className="border p-2 text-right">{row.amount > 0 ? naira(row.amount) : "-"}</td>
              </tr>
            ))}

            <tr className="bg-slate-50 font-semibold">
              <td className="border p-2" colSpan={2}>SUB-TOTAL</td>
              <td className="border p-2 text-right">{naira(coreSubtotal)}</td>
            </tr>

            <tr className="bg-slate-100 font-semibold">
              <td className="border p-2" colSpan={3}>OPTIONALS</td>
            </tr>

            {optionalRows.map((row) => (
              <tr key={`optional-${row.name}`}>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">Optional</td>
                <td className="border p-2 text-right">{row.amount > 0 ? naira(row.amount) : "-"}</td>
              </tr>
            ))}

            <tr className="bg-slate-50 font-semibold">
              <td className="border p-2" colSpan={2}>TOTAL FEES</td>
              <td className="border p-2 text-right">{naira(coreSubtotal + optionalSubtotal)}</td>
            </tr>

            <tr className="font-semibold">
              <td className="border p-2" colSpan={2}>INVOICE BILLED TOTAL</td>
              <td className="border p-2 text-right">{naira(invoice.totalAmount)}</td>
            </tr>

            {Array.from(invoicedAmountByName.entries()).filter(([name]) => !coreOrder.includes(name) && !optionalOrder.includes(name)).map(([name, amount]) => (
              <tr key={`extra-${name}`}>
                <td className="border p-2">{name}</td>
                <td className="border p-2">Other</td>
                <td className="border p-2 text-right">{naira(amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded border p-3 text-sm">
            <p className="font-semibold">Bank Details</p>
            <p>{invoice.school.branding?.bankName ?? "Bank"}</p>
            <p>{invoice.school.branding?.bankAccountName ?? "Account Name"}</p>
            <p>{invoice.school.branding?.bankAccountNumber ?? "Account Number"}</p>
            {paymentRules.length ? (
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-600">
                {paymentRules.map((rule) => <li key={rule}>{rule.replace(/^\d+\.\s*/, "")}</li>)}
              </ol>
            ) : (
              <p className="mt-2 text-xs text-slate-600">{ruleText}</p>
            )}
          </div>
          <div className="rounded border p-3 text-sm">
            <p>Total: <strong>{naira(invoice.totalAmount)}</strong></p>
            <p>Paid: <strong>{naira(invoice.amountPaid)}</strong></p>
            <p>Balance: <strong>{naira(invoice.balance)}</strong></p>
            <p className="mt-4 text-xs text-slate-500">{APP_POWERED_BY}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
