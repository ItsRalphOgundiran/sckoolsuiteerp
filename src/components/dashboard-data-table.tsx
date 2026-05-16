"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TableRowData = {
  id: string;
  primary: string;
  secondary?: string;
  status?: string;
  amount?: string;
  date?: string;
};

export function DashboardDataTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: TableRowData[];
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const pageSize = 6;
  const statuses = useMemo(() => ["ALL", ...Array.from(new Set(rows.map((item) => item.status).filter(Boolean)))], [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((item) => {
      const matchStatus = status === "ALL" || item.status === status;
      const matchQuery =
        !q ||
        item.primary.toLowerCase().includes(q) ||
        (item.secondary?.toLowerCase().includes(q) ?? false) ||
        (item.amount?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchQuery;
    });
  }, [rows, query, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div className="flex flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search records"
            className="h-8 w-44"
          />
          <select
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginated.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{row.primary}</p>
                    <p className="text-xs text-slate-500">{row.secondary ?? "-"}</p>
                  </TableCell>
                  <TableCell>{row.status ?? "-"}</TableCell>
                  <TableCell>{row.amount ?? "-"}</TableCell>
                  <TableCell>{row.date ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">{emptyMessage}</div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {paginated.length} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-2 py-1 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-2 py-1 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
