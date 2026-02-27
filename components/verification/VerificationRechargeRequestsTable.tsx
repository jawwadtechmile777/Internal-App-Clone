"use client";

import { safeParsePaymentDetails } from "@/lib/safeJson";
import { StatusBadge } from "@/components/entity/StatusBadge";
import { CheckCircle2, Eye, Image as ImageIcon, Loader2, XCircle } from "lucide-react";
import type { RechargeRequestRow } from "@/types/recharge";

interface VerificationRechargeRequestsTableProps {
  rows: RechargeRequestRow[];
  loading?: boolean;
  emptyMessage?: string;
  busyId?: string | null;
  busyAction?: "approve" | "reject" | null;
  onView: (row: RechargeRequestRow) => void;
  onApprove: (row: RechargeRequestRow) => void;
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

function bonusDisplay(r: RechargeRequestRow): string {
  if (Number(r.bonus_percentage ?? 0) > 0) return `${Number(r.bonus_percentage).toLocaleString("en-US")}%`;
  if (Number(r.bonus_amount ?? 0) > 0) return formatAmount(r.bonus_amount);
  return "—";
}

function ptAccountDetails(r: RechargeRequestRow): string {
  const pm = r.pt_payment_method;
  if (!pm) return "—";
  const d = safeParsePaymentDetails(pm.details);
  const title =
    (d["account_title"] as string | undefined) ??
    (d["account_name"] as string | undefined) ??
    (d["holder_name"] as string | undefined) ??
    (d["name"] as string | undefined) ??
    undefined;
  const number =
    (d["account_number"] as string | undefined) ??
    (d["mobile_number"] as string | undefined) ??
    (d["mobile"] as string | undefined) ??
    (d["phone_number"] as string | undefined) ??
    (d["iban"] as string | undefined) ??
    undefined;
  const parts = [pm.method_name];
  if (title) parts.push(title);
  if (number) parts.push(number);
  return parts.join(" • ");
}

function computeStatus(r: RechargeRequestRow): string {
  if (r.operations_status === "completed") return "Completed";
  if (r.operations_status === "cancelled") return "Cancelled";
  if (r.operations_status === "waiting_operations") return "Waiting Operations";
  if (r.operations_status === "processing") return "Processing";
  if (r.verification_status === "approved") return "Verified";
  if (r.verification_status === "rejected") return "Rejected";
  if (r.verification_status === "pending" && r.entity_status === "payment_submitted") return "Pending Verification";
  if (r.verification_status === "pending") return "Awaiting Payment";
  return r.entity_status ?? "—";
}

export function VerificationRechargeRequestsTable({
  rows,
  loading,
  emptyMessage = "No PT requests.",
  busyId,
  busyAction,
  onView,
  onApprove,
  onReject,
}: VerificationRechargeRequestsTableProps) {
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
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Bonus</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right whitespace-nowrap">Final</th>
            <th className="px-4 py-3 font-medium text-gray-300">PT Account Details</th>
            <th className="w-12 px-2 py-3 font-medium text-gray-300 text-center">Proof</th>
            <th className="px-4 py-3 font-medium text-gray-300">Status</th>
            <th className="px-4 py-3 font-medium text-gray-300">Created at</th>
            <th className="px-4 py-3 font-medium text-gray-300 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-slate-800/30">
          {rows.map((r) => {
            const status = computeStatus(r);
            const canAct = r.verification_status === "pending" && r.entity_status === "payment_submitted";
            const rowBusy = busyId === r.id;
            const approveLoading = rowBusy && busyAction === "approve";
            const rejectLoading = rowBusy && busyAction === "reject";
            const hasProof = !!r.entity_payment_proof_path;

            return (
              <tr key={r.id} className="hover:bg-slate-700/40">
                <td className="px-4 py-3 text-gray-100">{r.player?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-100">{r.entity?.name ?? "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{formatAmount(r.amount)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{bonusDisplay(r)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-100">{formatAmount(r.final_amount ?? null)}</td>
                <td className="px-4 py-3 text-gray-300">{ptAccountDetails(r)}</td>
                <td className="w-12 px-2 py-3 text-center">
                  {hasProof ? (
                    <a
                      href={r.entity_payment_proof_path!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sky-400 hover:bg-slate-700/60 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      title="View payment proof"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
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
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canAct ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(r)}
                          disabled={rowBusy || !hasProof}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          title={hasProof ? "Verify" : "Screenshot required"}
                        >
                          {approveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
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
