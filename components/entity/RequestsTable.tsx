"use client";

import { StatusBadge } from "@/components/entity/StatusBadge";

export interface RequestTableRow {
  id: string;
  player: string;
  amount: string;
  status: string | null;
  created_at: string | null;
}

interface RequestsTableProps {
  title?: string;
  headerContent?: React.ReactNode;
  rows: RequestTableRow[];
  loading?: boolean;
  emptyMessage?: string;
  renderActions: (row: RequestTableRow) => React.ReactNode;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

export function RequestsTable({
  title,
  headerContent,
  rows,
  loading,
  emptyMessage = "No records found.",
  renderActions,
}: RequestsTableProps) {
  return (
    <div className="rounded-xl border border-gray-700 bg-slate-800/50">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div className="min-w-0 flex-1">
          {headerContent ?? (
            <h3 className="truncate text-sm font-semibold text-gray-100">
              {title ?? ""}
            </h3>
          )}
        </div>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>

      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-gray-400">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-left text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-300">Request</th>
                <th className="px-4 py-3 font-medium text-gray-300">Player</th>
                <th className="px-4 py-3 font-medium text-gray-300">Amount</th>
                <th className="px-4 py-3 font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 font-medium text-gray-300">Created</th>
                <th className="px-4 py-3 font-medium text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-slate-800/30">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-700/40">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-100">{r.player || "—"}</td>
                  <td className="px-4 py-3 text-gray-100">{r.amount}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3 text-right">{renderActions(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

