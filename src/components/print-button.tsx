"use client";

export function PrintButton() {
  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
            return;
          }
          window.location.href = "/parent/fees";
        }}
      >
        Close
      </button>
      <button
        className="rounded bg-[var(--brand-primary)] px-3 py-2 text-sm text-white"
        onClick={() => window.print()}
      >
        Print Bill
      </button>
    </div>
  );
}
