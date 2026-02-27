"use client";

import { safeParsePaymentDetails } from "@/lib/safeJson";
import { StatusBadge } from "@/components/entity/StatusBadge";
import { CheckCircle2, Eye, Loader2, XCircle } from "lucide-react";
import type { RechargeRequestRow } from "@/types/recharge";

interface OperationsRechargeRequestsTableProps {
  rows: RechargeRequestRow[];
  loading?: boolean;
  emptyMessage?: string;
  busyId?: string | null;
  busyAction?: "complete" | "reject" | null;
  onView: (row: RechargeRequestRow) => void;
  onComplete: (row: RechargeRequestRow) => void;
  onReject: (row: RechargeRequestRow) => void;
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

function computeStatus(r: RechargeRequestRow): string {
  if (r.operations_status === "completed") return "Completed";
  if (r.operations_status === "cancelled") return "Cancelled";
  if (r.operations_status === "rejected") return "Rejected";
  if (r.operations_status === "processing") return "Processing";
  if (r.finance_status === "verified") return "Finance Verified";
  if (r.finance_status === "verification_pending") return "Verification Pending";
  if (r.finance_status === "rejected") return "Rejected (Finance)";
  if (r.finance_status !== "approved") return "Waiting Finance Approval";
  if (r.entity_status !== "payment_submitted") return "Waiting Payment";
  return "In progress";
}

function bonusDisplay(r: RechargeRequestRow): string {
  if (Number(r.bonus_percentage ?? 0) > 0) return `${Number(r.bonus_percentage).toLocaleString("en-US")}%`;
  if (Number(r.bonus_amount ?? 0) > 0) return formatAmount(r.bonus_amount);
  return "—";
}

function playerAccountDetails(r: RechargeRequestRow): string {
  const pm = r.payment_method;
  if (!pm) return "—";
  const details = safeParsePaymentDetails(pm.details);
  const key =
    (details["account_number"] as string | undefined) ??
    (details["iban"] as string | undefined) ??
    (details["username"] as string | undefined) ??
    (details["upi"] as string | undefined) ??
    undefined;
  return key ? `${pm.method_name} • ${key}` : pm.method_name;
}

function tagDetails(r: RechargeRequestRow): string {
  if (!r.tag_type) return "—";
  if (r.tag_type === "CT") {
    const acct = r.payment_method_account;
    if (!acct) return "CT • —";
    const bank = acct.payment_method?.name ? `${acct.payment_method.name} • ` : "";
    const holder = acct.holder_name ? ` • ${acct.holder_name}` : "";
    const iban = acct.iban ? ` • ${acct.iban}` : "";
    return `${bank}${acct.account_name} • ${acct.account_number}${holder}${iban}`;
  }
  const pt = r.pt_payment_method;
  if (!pt) return "PT • —";
  const details = safeParsePaymentDetails(pt.details);
  const key =
    (details["account_number"] as string | undefined) ??
    (details["iban"] as string | undefined) ??
    (details["username"] as string | undefined) ??
    (details["upi"] as string | undefined) ??
    undefined;
  return key ? `${pt.method_name} • ${key}` : pt.method_name;
}

export function OperationsRechargeRequestsTable({
  rows,
  loading,
  emptyMessage = "No recharge requests.",
  busyId,
  busyAction,
  onView,
  onComplete,
  onReject,
}: OperationsRechargeRequestsTableProps) {
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
            <th className="px-4 py-3 font-medium text-gray-300">Entity</th>
            <th className="px-4 py-3 font-medium text-gray-300">Player</th>
            <th className="px-4 py-3 font-medium text-gray-300">Game</th>
            <th className="px-4 py-3 font-medium text-gray-300">Player account details</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Bonus</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Final</th>
            <th className="px-4 py-3 font-medium text-gray-300">Tag type</th>
            <th className="px-4 py-3 font-medium text-gray-300">Tag details</th>
            <th className="px-4 py-3 font-medium text-gray-300">Status</th>
            <th className="px-4 py-3 font-medium text-gray-300">Created at</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rows.map((r) => {
            const status = computeStatus(r);
            const canAct = r.operations_status === "processing";
            const rowBusy = busyId === r.id;
            const completeLoading = rowBusy && busyAction === "complete";
            const rejectLoading = rowBusy && busyAction === "reject";
            return (
              <tr key={r.id} className="hover:bg-slate-700/40">
                <td className="px-4 py-3 text-gray-100">{r.entity?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-100">{r.player?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{r.game?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{playerAccountDetails(r)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{formatAmount(r.amount)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{bonusDisplay(r)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{formatAmount(r.final_amount ?? null)}</td>
                <td className="px-4 py-3 text-gray-300">{r.tag_type ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{tagDetails(r)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} />
                </td>
                <td className="px-4 py-3 text-gray-300">{formatDate(r.created_at ?? null)}</td>
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

                    {canAct ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onComplete(r)}
                          disabled={rowBusy}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          title="Complete"
                        >
                          {completeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(r)}
                          disabled={rowBusy}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          title="Reject"
                        >
                          {rejectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        </button>
                      </>
                    ) : null}
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
