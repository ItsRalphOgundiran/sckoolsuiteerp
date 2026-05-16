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

      {filtered.length ? filtered.map((invoice) => (
        <article key={invoice.id} className="glass-panel rounded-2xl p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">#{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500">{invoice.studentName} • {invoice.className ?? "Class"} • {invoice.termName} / {invoice.sessionName}</p>
            </div>
            <span className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white">{invoice.status}</span>
          </div>

          <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
            <p>Total: <strong>{money(invoice.totalAmount)}</strong></p>
            <p>Paid: <strong>{money(invoice.amountPaid)}</strong></p>
            <p>Balance: <strong>{money(invoice.balance)}</strong></p>
          </div>

          <div className="mt-2 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Fee Breakdown</p>
            {invoice.items.length ? invoice.items.map((item) => <p key={item.id}>{item.name}: {money(item.amount)}</p>) : <p>No line items.</p>}
          </div>

          <div className="mt-2 rounded-lg border border-slate-200 bg-white/70 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Bank Payment Instruction</p>
            <p>{bank.bankName ?? "Bank"} • {bank.bankAccountName ?? "Account Name"} • {bank.bankAccountNumber ?? "Account Number"}</p>
            <p>{invoice.paymentInstructions ?? bank.bankInstructions ?? "Use invoice number as narration."}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href={`/invoice/${invoice.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white">Open Invoice</Link>
            <Link href={`/invoice/${invoice.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-white">Print Invoice</Link>
            <button type="button" className="rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-white" onClick={() => setActiveInvoice(activeInvoice === invoice.id ? null : invoice.id)}>
              I have paid
            </button>
          </div>

          {activeInvoice === invoice.id ? (
            <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white/85 p-3 text-sm md:grid-cols-2">
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
              <button type="button" className="rounded-md bg-emerald-600 px-3 py-2 text-white md:col-span-2" onClick={() => submitPaymentNotice(invoice.id)}>Submit Pending Confirmation</button>
            </div>
          ) : null}
        </article>
      )) : <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">No invoices match this filter.</div>}
    </section>
  );
}
