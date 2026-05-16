"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export function ParentMessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ recipient: "School Admin", subject: "", message: "" });

  async function loadMessages() {
    const response = await fetch("/api/parent/messages");
    const data = await response.json();
    setMessages(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  async function submit() {
    const response = await fetch("/api/parent/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setToast(payload?.error ?? "Could not send message.");
      return;
    }

    setToast("Message sent successfully.");
    setForm({ recipient: "School Admin", subject: "", message: "" });
    await loadMessages();
  }

  return (
    <section className="grid gap-3 xl:grid-cols-[1fr_1.2fr]">
      <article className="glass-panel rounded-2xl p-4">
        <h3 className="mb-3 text-base font-semibold text-slate-900">New Message</h3>
        <div className="space-y-2 text-sm">
          <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.recipient} onChange={(e) => setForm((s) => ({ ...s, recipient: e.target.value }))}>
            <option>School Admin</option>
            <option>Class Teacher</option>
            <option>Account Office</option>
          </select>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} />
          <textarea className="h-28 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Write your message" value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} />
          <button type="button" onClick={submit} className="rounded-md bg-[var(--brand-primary)] px-3 py-2 text-white">Send Message</button>
          {toast ? <p className="text-xs text-slate-600">{toast}</p> : null}
          <p className="text-xs text-slate-500">Status uses sent/read placeholder lifecycle.</p>
        </div>
      </article>

      <article className="glass-panel rounded-2xl p-4">
        <h3 className="mb-3 text-base font-semibold text-slate-900">Conversation List</h3>
        <div className="space-y-2 text-sm">
          {messages.length ? messages.map((item) => (
            <div key={item.id} className="glass-soft rounded-xl p-3">
              <p className="font-medium text-slate-900">To: {item.recipient}</p>
              <p className="text-xs text-slate-500">{item.subject}</p>
              <p className="mt-1 text-slate-700">{item.message}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{item.status}</p>
            </div>
          )) : <p className="text-slate-500">No messages yet.</p>}
        </div>
      </article>
    </section>
  );
}
