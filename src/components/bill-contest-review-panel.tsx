"use client";

import { useEffect, useMemo, useState } from "react";

type ContestItem = {
  billItemId: string;
  feeName: string;
  originalAmount: number;
  proposedAmount: number;
  optional: boolean;
};

type ContestRecord = {
  billId: string;
  billNumber: string;
  studentName: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  parentComment: string;
  staffComment: string;
  submittedAt: string;
  updatedAt: string;
  items: ContestItem[];
};

type ContestAudit = {
  id: string;
  billId: string;
  actorRole: string | null;
  action: string;
  createdAt: string;
};

type BillContestReviewPanelProps = {
  currentRole?: string;
};

function contestStatusLabel(status: ContestRecord["status"]) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";
    case "UNDER_REVIEW":
      return "Under Review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
}

export function BillContestReviewPanel({ currentRole }: BillContestReviewPanelProps) {
  const [contests, setContests] = useState<ContestRecord[]>([]);
  const [audits, setAudits] = useState<ContestAudit[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [commentByBill, setCommentByBill] = useState<Record<string, string>>({});
  const canApprove = currentRole !== "ACCOUNTANT";

  async function loadContests() {
    setLoading(true);
    setToast("");
    try {
      const response = await fetch("/api/admin/bills/contests", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { contests?: ContestRecord[]; audits?: ContestAudit[]; error?: string };
      if (!response.ok) {
        setToast(payload.error ?? "Could not load bill contests.");
        return;
      }
      setContests(Array.isArray(payload.contests) ? payload.contests : []);
      setAudits(Array.isArray(payload.audits) ? payload.audits : []);
    } catch {
      setToast("Could not load bill contests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContests();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const openContests = useMemo(() => contests.filter((item) => item.status === "SUBMITTED" || item.status === "UNDER_REVIEW"), [contests]);

  async function submitReview(billId: string, action: "UNDER_REVIEW" | "APPROVED" | "REJECTED") {
    const contest = contests.find((item) => item.billId === billId);
    if (!contest) return;

    const response = await fetch("/api/admin/bills/contests/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billId,
        action,
        staffComment: commentByBill[billId] ?? "",
        finalAdjustments: [],
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setToast(payload.error ?? "Could not update contest.");
      return;
    }

    setToast(action === "APPROVED" ? "Bill finalized and parent notified." : "Contest updated.");
    await loadContests();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Bill Contest Review</h3>
        <span className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">Open: {openContests.length}</span>
      </div>

      {toast ? <p className="mb-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{toast}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading contests...</p> : null}

      {!loading && !contests.length ? <p className="text-sm text-slate-500">No bill contests submitted yet.</p> : null}

      <div className="space-y-3">
        {contests.map((contest) => (
          <article key={contest.billId} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Bill {contest.billNumber} • {contest.studentName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Submitted {new Date(contest.submittedAt).toLocaleString("en-GB")}</p>
              </div>
              <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">{contestStatusLabel(contest.status)}</span>
            </div>

            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300"><span className="font-medium">Parent:</span> {contest.parentComment}</p>

            <div className="mt-2 space-y-1">
              {contest.items.length ? contest.items.map((item) => (
                <div key={item.billItemId} className="grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-2 text-xs md:grid-cols-[1.4fr_1fr_1fr] dark:bg-slate-800/60">
                  <p className="font-medium text-slate-700 dark:text-slate-200">{item.feeName}</p>
                  <p className="text-slate-600 dark:text-slate-300">Original: {money(item.originalAmount)}</p>
                  <p className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 font-medium text-amber-700">Off (Remove Requested)</p>
                </div>
              )) : <p className="text-xs text-slate-600 dark:text-slate-300">No optional fee to remove. Parent submitted a statement-only contest.</p>}
            </div>

            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] dark:border-slate-700 dark:bg-slate-800/40">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Audit Timeline</p>
              {audits.filter((row) => row.billId === contest.billId).slice(-5).map((row) => (
                <p key={row.id} className="text-slate-600 dark:text-slate-300">
                  {new Date(row.createdAt).toLocaleString("en-GB")} • {row.action} {row.actorRole ? `(${row.actorRole})` : ""}
                </p>
              ))}
              {!audits.some((row) => row.billId === contest.billId) ? <p className="text-slate-500 dark:text-slate-400">No audit entries yet.</p> : null}
            </div>

            <textarea
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              placeholder="Comment to parent"
              value={commentByBill[contest.billId] ?? contest.staffComment ?? ""}
              onChange={(e) => setCommentByBill((prev) => ({ ...prev, [contest.billId]: e.target.value }))}
            />

            {(contest.status === "SUBMITTED" || contest.status === "UNDER_REVIEW") ? (
              <div className="mt-2 space-y-2">
                {!canApprove ? <p className="text-xs text-amber-700 dark:text-amber-400">Approve is reserved for Super Admin, School Admin, and Principal.</p> : null}
                <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50" onClick={() => submitReview(contest.billId, "UNDER_REVIEW")}>Mark Under Review</button>
                <button type="button" className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700" onClick={() => submitReview(contest.billId, "REJECTED")}>Reject</button>
                <button
                  type="button"
                  className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
                  onClick={() => submitReview(contest.billId, "APPROVED")}
                  disabled={!canApprove}
                  aria-disabled={!canApprove}
                  title={canApprove ? "Finalize and approve bill contest" : "Only Super Admin, School Admin, or Principal can approve"}
                >
                  Finalize and Approve
                </button>
              </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
