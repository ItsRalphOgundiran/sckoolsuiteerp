"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Child = { id: string; name: string };
type InvoiceItem = { id: string; name: string; amount: number };
type Invoice = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  className?: string;
  termName: string;
  sessionName: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate?: string | null;
  paymentInstructions?: string | null;
  items: InvoiceItem[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
}

function invoiceStatusStyle(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "PART_PAYMENT":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "PENDING":
      return "bg-blue-100 text-blue-700 border-blue-300";
    default:
      return "bg-rose-100 text-rose-700 border-rose-300";
  }
}

export function ParentInvoiceHub({
  childOptions,
  invoices,
  bank,
}: {
  childOptions: Child[];
  invoices: Invoice[];
  bank: { bankName?: string | null; bankAccountName?: string | null; bankAccountNumber?: string | null; bankInstructions?: string | null };
}) {
  const [childFilter, setChildFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeInvoice, setActiveInvoice] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [formState, setFormState] = useState({
    amountPaid: "",
    paymentMethod: "Transfer",
    bankName: "",
    transactionReference: "",
    paymentDate: "",
    proofPlaceholder: "",
  });

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const childOk = childFilter === "ALL" || invoice.studentId === childFilter;
      const statusOk = statusFilter === "ALL" || invoice.status === statusFilter;
      return childOk && statusOk;
    });
  }, [invoices, childFilter, statusFilter]);

  async function submitPaymentNotice(invoiceId: string) {
    const response = await fetch("/api/parent/payments/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, ...formState }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setToast(payload?.error ?? "Could not submit payment notice.");
      return;
    }

    setToast("Payment notice submitted. Awaiting school confirmation.");
    setActiveInvoice(null);
    setTimeout(() => {
      window.location.reload();
    }, 700);
  }

  return (
    <section className="space-y-3">
      {toast ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div> : null}

      <div className="glass-soft grid gap-2 rounded-xl p-3 md:grid-cols-2">
        <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={childFilter} onChange={(e) => setChildFilter(e.target.value)}>
          <option value="ALL">All Children</option>
          {childOptions.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}
        </select>
        <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="UNPAID">unpaid</option>
          <option value="PART_PAYMENT">part-payment</option>
          <option value="PAID">paid</option>
          <option value="PENDING">pending-confirmation</option>
        </select>
      </div>

      {filtered.length ? filtered.map((invoice) => {
        const completion = invoice.totalAmount > 0 ? Math.min(100, (invoice.amountPaid / invoice.totalAmount) * 100) : 0;

        return (
          <article key={invoice.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-4 text-white">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Invoice #{invoice.invoiceNumber}</p>
                  <p className="text-xs text-white/80">{invoice.studentName} • {invoice.className ?? "Class"} • {invoice.termName} / {invoice.sessionName}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${invoiceStatusStyle(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Total</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{money(invoice.totalAmount)}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Paid</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{money(invoice.amountPaid)}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Balance</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{money(invoice.balance)}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Due Date</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-GB") : "Not set"}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Payment Progress</span>
                  <span>{completion.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${completion}%` }} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[1.5fr_1fr]">
                <section className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">Fee Breakdown</h4>
                  </div>
                  {invoice.items.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                            <th className="px-3 py-2">Fee Item</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2 text-right">Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item, idx) => {
                            const share = invoice.totalAmount > 0 ? (item.amount / invoice.totalAmount) * 100 : 0;
                            return (
                              <tr key={item.id} className={idx % 2 ? "bg-white" : "bg-slate-50/70"}>
                                <td className="px-3 py-2 font-medium text-slate-700">{item.name}</td>
                                <td className="px-3 py-2 text-right font-semibold text-slate-900">{money(item.amount)}</td>
                                <td className="px-3 py-2 text-right text-slate-600">{share.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="px-3 py-3 text-sm text-slate-500">No line items available for this invoice.</p>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <h4 className="mb-2 font-semibold uppercase tracking-wide text-slate-700">Bank Payment Instruction</h4>
                  <dl className="space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <dt className="font-medium text-slate-500">Bank</dt>
                      <dd className="text-right font-semibold text-slate-900">{bank.bankName ?? "Bank"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <dt className="font-medium text-slate-500">Account Name</dt>
                      <dd className="text-right font-semibold text-slate-900">{bank.bankAccountName ?? "Account Name"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <dt className="font-medium text-slate-500">Account Number</dt>
                      <dd className="text-right font-semibold text-slate-900">{bank.bankAccountNumber ?? "Account Number"}</dd>
                    </div>
                  </dl>
                  <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-[11px] text-blue-700">
                    {invoice.paymentInstructions ?? bank.bankInstructions ?? "Use invoice number as narration."}
                  </div>
                </section>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link href={`/invoice/${invoice.id}`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">Open Invoice</Link>
                <Link href={`/invoice/${invoice.id}`} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">Print Invoice</Link>
                <button type="button" className="rounded-lg bg-[var(--brand-primary)] px-3 py-1.5 font-medium text-white" onClick={() => setActiveInvoice(activeInvoice === invoice.id ? null : invoice.id)}>
                  I have paid
                </button>
              </div>

              {activeInvoice === invoice.id ? (
                <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white/85 p-3 text-sm md:grid-cols-2 dark:bg-slate-900/70">
                  <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Amount paid" value={formState.amountPaid} onChange={(e) => setFormState((s) => ({ ...s, amountPaid: e.target.value }))} />
                  <select className="rounded-md border border-slate-300 px-3 py-2" value={formState.paymentMethod} onChange={(e) => setFormState((s) => ({ ...s, paymentMethod: e.target.value }))}>
                    <option>Transfer</option>
                    <option>Cash</option>
                    <option>POS</option>
                  </select>
                  <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Bank name" value={formState.bankName} onChange={(e) => setFormState((s) => ({ ...s, bankName: e.target.value }))} />
                  <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Transaction reference" value={formState.transactionReference} onChange={(e) => setFormState((s) => ({ ...s, transactionReference: e.target.value }))} />
                  <input type="date" className="rounded-md border border-slate-300 px-3 py-2" value={formState.paymentDate} onChange={(e) => setFormState((s) => ({ ...s, paymentDate: e.target.value }))} />
                  <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Proof placeholder (URL or note)" value={formState.proofPlaceholder} onChange={(e) => setFormState((s) => ({ ...s, proofPlaceholder: e.target.value }))} />
                  <button type="button" className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white md:col-span-2" onClick={() => submitPaymentNotice(invoice.id)}>Submit Pending Confirmation</button>
                </div>
              ) : null}
            </div>
          </article>
        );
      }) : <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">No invoices match this filter.</div>}
    </section>
  );
}
