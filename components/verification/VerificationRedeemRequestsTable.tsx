"use client";

import { safeParsePaymentDetails } from "@/lib/safeJson";
import { StatusBadge } from "@/components/entity/StatusBadge";
import { Eye, ShieldCheck, Loader2 } from "lucide-react";
import type { RedeemRequestRow } from "@/types/redeem";

interface Props {
  rows: RedeemRequestRow[];
  loading?: boolean;
  emptyMessage?: string;
  busyId?: string | null;
  onView: (row: RedeemRequestRow) => void;
  onVerify: (row: RedeemRequestRow) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch { return "—"; }
}

function fmt(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function playerAccountDetails(r: RedeemRequestRow): string {
  const pm = r.payment_method;
  if (!pm) return "—";
  const d = safeParsePaymentDetails(pm.details);
  const acctNum =
    (d["account_number"] as string | undefined) ??
    (d["mobile_number"] as string | undefined) ??
    (d["mobile"] as string | undefined) ??
    (d["phone_number"] as string | undefined) ??
    (d["iban"] as string | undefined) ??
    undefined;
  return acctNum ? `${pm.method_name} • ${acctNum}` : pm.method_name;
}

export function VerificationRedeemRequestsTable({ rows, loading, emptyMessage = "No redeem requests.", busyId, onView, onVerify }: Props) {
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
            <th className="px-4 py-3 font-medium text-gray-300">Game</th>
            <th className="px-4 py-3 font-medium text-gray-300">Player Account Details</th>
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
          {rows.map((r) => {
            const canVerify = r.verification_status === "pending";
            const rowBusy = busyId === r.id;
            return (
              <tr key={r.id} className="hover:bg-slate-700/40">
                <td className="px-4 py-3 text-gray-100">{r.player?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-100">{r.entity?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{r.game?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{playerAccountDetails(r)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{fmt(r.total_amount)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{fmt(r.paid_amount)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-amber-200">{fmt(r.hold_amount)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-300">{fmt(r.remaining_amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-gray-300">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(r)}
                      disabled={rowBusy}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-300 hover:bg-slate-700/60 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canVerify && (
                      <button
                        type="button"
                        onClick={() => onVerify(r)}
                        disabled={rowBusy}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                        title="Verify"
                      >
                        {rowBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
