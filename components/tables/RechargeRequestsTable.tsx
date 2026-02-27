"use client";

import type { RechargeRequestRow } from "@/types/recharge";

interface RechargeRequestsTableProps {
  rows: RechargeRequestRow[];
  onRowClick?: (row: RechargeRequestRow) => void;
  loading?: boolean;
  emptyMessage?: string;
  /** Show Submit Payment action when finance approved. */
  showSubmitPayment?: boolean;
  onSubmitPayment?: (row: RechargeRequestRow) => void;
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

function SubmitIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9L12 14L17 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RechargeRequestsTable({
  rows,
  onRowClick,
  loading,
  emptyMessage = "No requests found.",
  showSubmitPayment = false,
  onSubmitPayment,
}: RechargeRequestsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        Loading...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-slate-800/50">
      <table className="min-w-full divide-y divide-gray-700 text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-300">ID</th>
            <th className="px-4 py-3 font-medium text-gray-300">Entity</th>
            <th className="px-4 py-3 font-medium text-gray-300">Player</th>
            <th className="px-4 py-3 font-medium text-gray-300">Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300">Final</th>
            <th className="px-4 py-3 font-medium text-gray-300">Tag</th>
            <th className="px-4 py-3 font-medium text-gray-300">Entity</th>
            <th className="px-4 py-3 font-medium text-gray-300">Finance</th>
            <th className="px-4 py-3 font-medium text-gray-300">Verification</th>
            <th className="px-4 py-3 font-medium text-gray-300">Operations</th>
            <th className="px-4 py-3 font-medium text-gray-300">Created</th>
            {showSubmitPayment && onSubmitPayment ? (
              <th className="px-4 py-3 font-medium text-gray-300 text-right">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={
                onRowClick
                  ? "cursor-pointer hover:bg-slate-700/50 focus-within:bg-slate-700/50"
                  : ""
              }
            >
              <td className="px-4 py-3 font-mono text-xs text-gray-400">
                {row.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-gray-100">
                {row.entity?.name ?? row.entity_id}
              </td>
              <td className="px-4 py-3 text-gray-100">
                {row.player?.name ?? row.player_id}
              </td>
              <td className="px-4 py-3 text-gray-100">
                {formatAmount(row.amount)}
              </td>
              <td className="px-4 py-3 text-gray-100">
                {formatAmount(row.final_amount)}
              </td>
              <td className="px-4 py-3">
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-medium text-gray-300">
                  {row.tag_type ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400">
                {row.entity_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {row.finance_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {row.verification_status}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {row.operations_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatDate(row.created_at)}
              </td>
              {showSubmitPayment && onSubmitPayment ? (
                <td
                  className="px-4 py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.finance_status === "approved" && !row.entity_payment_submitted_at ? (
                    <button
                      type="button"
                      onClick={() => onSubmitPayment(row)}
                      className="inline-flex items-center gap-1 rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      title="Submit payment proof"
                    >
                      <SubmitIcon />
                      Submit Payment
                    </button>
                  ) : row.entity_payment_submitted_at ? (
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-gray-400">
                      Payment Submitted
                    </span>
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
