"use client";

import type { RechargeRequestRow } from "@/types/recharge";

interface RechargeRequestsTableProps {
  rows: RechargeRequestRow[];
  onRowClick?: (row: RechargeRequestRow) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function formatAmount(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export function RechargeRequestsTable({
  rows,
  onRowClick,
  loading,
  emptyMessage = "No requests found.",
}: RechargeRequestsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        Loading...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-700">ID</th>
            <th className="px-4 py-3 font-medium text-slate-700">Entity</th>
            <th className="px-4 py-3 font-medium text-slate-700">Player</th>
            <th className="px-4 py-3 font-medium text-slate-700">Amount</th>
            <th className="px-4 py-3 font-medium text-slate-700">Final</th>
            <th className="px-4 py-3 font-medium text-slate-700">Tag</th>
            <th className="px-4 py-3 font-medium text-slate-700">Entity</th>
            <th className="px-4 py-3 font-medium text-slate-700">Finance</th>
            <th className="px-4 py-3 font-medium text-slate-700">Verification</th>
            <th className="px-4 py-3 font-medium text-slate-700">Operations</th>
            <th className="px-4 py-3 font-medium text-slate-700">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={
                onRowClick
                  ? "cursor-pointer hover:bg-slate-50"
                  : ""
              }
            >
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {row.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-slate-800">
                {row.entity?.name ?? row.entity_id}
              </td>
              <td className="px-4 py-3 text-slate-800">
                {row.player?.name ?? row.player_id}
              </td>
              <td className="px-4 py-3 text-slate-800">
                {formatAmount(row.amount)}
              </td>
              <td className="px-4 py-3 text-slate-800">
                {formatAmount(row.final_amount)}
              </td>
              <td className="px-4 py-3">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {row.tag_type ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.entity_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.finance_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.verification_status}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.operations_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatDate(row.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
