"use client";

export function PrintButton() {
  return (
    <button
      className="rounded bg-[var(--brand-primary)] px-3 py-2 text-sm text-white"
      onClick={() => window.print()}
    >
      Print
    </button>
  );
}
