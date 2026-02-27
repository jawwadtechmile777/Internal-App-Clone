"use client";

import { StatusBadge } from "@/components/entity/StatusBadge";
import { Eye } from "lucide-react";
import type { RedeemRequestRow } from "@/types/redeem";

interface FinanceRedeemRequestsTableProps {
  rows: RedeemRequestRow[];
  loading?: boolean;
  emptyMessage?: string;
  onView: (row: RedeemRequestRow) => void;
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

export function FinanceRedeemRequestsTable({
  rows,
  loading,
  emptyMessage = "No redeem requests.",
  onView,
}: FinanceRedeemRequestsTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-slate-800/50">
      <table className="min-w-full divide-y divide-gray-700 text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-300">Player</th>
            <th className="px-4 py-3 font-medium text-gray-300">Entity</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Total Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Paid Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Hold Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Remaining</th>
            <th className="px-4 py-3 font-medium text-gray-300">Status</th>
            <th className="px-4 py-3 font-medium text-gray-300">Created at</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-700/40">
              <td className="px-4 py-3 text-gray-100">{r.player?.name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-100">{r.entity?.name ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-100">{formatAmount(r.total_amount)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-100">{formatAmount(r.paid_amount)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-amber-200">{formatAmount(r.hold_amount)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-emerald-300">{formatAmount(r.remaining_amount)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-gray-300">{formatDate(r.created_at ?? null)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onView(r)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-300 hover:bg-slate-700/60 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
