"use client";

import { useState } from "react";
import { humanizeEnum } from "@/lib/utils";

type Complaint = {
  id: string;
  category: string;
  subject: string;
  complaint: string;
  status: string;
  createdAt: string;
};

export function ParentComplaintsPanel({ initialComplaints = [] }: { initialComplaints?: Complaint[] }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ category: "Academic", subject: "", complaint: "" });

  async function loadComplaints() {
    const response = await fetch("/api/parent/complaints");
    const data = await response.json();
    setComplaints(Array.isArray(data) ? data : []);
  }

  async function submit() {
    const response = await fetch("/api/parent/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setToast(payload?.error ?? "Could not submit complaint.");
      return;
    }

    setToast("Complaint submitted successfully.");
    setForm({ category: "Academic", subject: "", complaint: "" });
    await loadComplaints();
  }

  return (
    <section className="grid gap-3 xl:grid-cols-[1fr_1.2fr]">
      <article className="glass-panel rounded-2xl p-4">
        <h3 className="mb-3 text-base font-semibold text-slate-900">Submit Complaint</h3>
        <div className="space-y-2 text-sm">
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
            <option>Academic</option>
            <option>Finance</option>
            <option>Conduct</option>
            <option>Facilities</option>
            <option>Other</option>
          </select>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} />
          <textarea className="h-28 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Describe the complaint clearly" value={form.complaint} onChange={(e) => setForm((s) => ({ ...s, complaint: e.target.value }))} />
          <button type="button" onClick={submit} className="rounded-md bg-[var(--brand-primary)] px-3 py-2 text-white">Submit Complaint</button>
          {toast ? <p className="text-xs text-slate-600">{toast}</p> : null}
          <p className="text-xs text-slate-500">Each complaint is logged with status for school follow-up.</p>
        </div>
      </article>

      <article className="glass-panel rounded-2xl p-4">
        <h3 className="mb-3 text-base font-semibold text-slate-900">Complaint History</h3>
        <div className="space-y-2 text-sm">
          {complaints.length ? complaints.map((item) => (
            <div key={item.id} className="glass-soft rounded-xl p-3">
              <p className="font-medium text-slate-900">{item.subject}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{item.category}</p>
              <p className="mt-1 text-slate-700">{item.complaint}</p>
              <p className="mt-1 text-[11px] tracking-wide text-slate-500">{humanizeEnum(item.status)}</p>
            </div>
          )) : <p className="text-slate-500">No complaints logged yet.</p>}
        </div>
      </article>
    </section>
  );
}
