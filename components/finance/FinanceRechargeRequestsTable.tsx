"use client";

import { safeParsePaymentDetails } from "@/lib/safeJson";
import { StatusBadge } from "@/components/entity/StatusBadge";
import { CheckCircle2, Eye, Loader2, XCircle } from "lucide-react";
import type { RechargeRequestRow } from "@/types/recharge";

interface FinanceRechargeRequestsTableProps {
  rows: RechargeRequestRow[];
  loading?: boolean;
  emptyMessage?: string;
  busyId?: string | null;
  busyAction?: "approve" | "reject" | "verify" | "reject_verification" | null;
  onView: (row: RechargeRequestRow) => void;
  onApprove: (row: RechargeRequestRow) => void;
  onReject: (row: RechargeRequestRow) => void;
  onVerify?: (row: RechargeRequestRow) => void;
  onRejectVerification?: (row: RechargeRequestRow) => void;
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
  if (r.operations_status === "rejected") return "Rejected (Operations)";

  if (r.finance_status === "verified") return "Finance Verified";
  if (r.finance_status === "verification_pending") return "Verification pending";
  if (r.finance_status === "rejected") return "Rejected (Finance)";
  if (r.finance_status !== "approved") return "Waiting Finance Approval";

  if (r.entity_status !== "payment_submitted") return "Waiting Payment Submission";

  if (r.tag_type === "CT") {
    if (r.operations_status === "waiting_operations") return "Waiting Operations";
    return "Waiting Finance Verification";
  }

  if (r.tag_type === "PT") {
    if (r.verification_status === "rejected") return "Rejected (Verification)";
    if (r.verification_status === "approved") return "Waiting Operations";
    return "Waiting Verification";
  }

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
    const branch = (acct as unknown as { branch_name?: string | null }).branch_name
      ? ` • ${(acct as unknown as { branch_name?: string | null }).branch_name}`
      : "";
    return `${bank}${acct.account_name} • ${acct.account_number}${holder}${iban}${branch}`;
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

export function FinanceRechargeRequestsTable({
  rows,
  loading,
  emptyMessage = "No recharge requests.",
  busyId,
  busyAction,
  onView,
  onApprove,
  onReject,
  onVerify,
  onRejectVerification,
}: FinanceRechargeRequestsTableProps) {
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
            <th className="px-4 py-3 font-medium text-gray-300">Proof</th>
            <th className="px-4 py-3 font-medium text-gray-300">Entity</th>
            <th className="px-4 py-3 font-medium text-gray-300">Player</th>
            <th className="px-4 py-3 font-medium text-gray-300">Game</th>
            <th className="px-4 py-3 font-medium text-gray-300">Player account details</th>
            <th className="px-4 py-3 font-medium text-gray-300">Amount</th>
            <th className="px-4 py-3 font-medium text-gray-300">Bonus</th>
            <th className="px-4 py-3 font-medium text-gray-300">Final amount</th>
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
            const isPending = r.finance_status === "pending";
            const isVerificationPending = r.finance_status === "verification_pending";
            const rowBusy = busyId === r.id;
            const approveLoading = rowBusy && busyAction === "approve";
            const rejectLoading = rowBusy && busyAction === "reject";
            const verifyLoading = rowBusy && busyAction === "verify";
            const rejectVerificationLoading = rowBusy && busyAction === "reject_verification";
            return (
              <tr key={r.id} className="hover:bg-slate-700/40">
                <td className="px-4 py-3">
                  {r.entity_payment_proof_path ? (
                    <a
                      href={r.entity_payment_proof_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-10 w-10 overflow-hidden rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      title="Open proof"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.entity_payment_proof_path} alt="Proof" className="h-10 w-10 object-cover" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-100">{r.entity?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-100">{r.player?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{r.game?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-300">{playerAccountDetails(r)}</td>
                <td className="px-4 py-3 text-gray-100">{formatAmount(r.amount)}</td>
                <td className="px-4 py-3 text-gray-100">{bonusDisplay(r)}</td>
                <td className="px-4 py-3 text-gray-100">{formatAmount(r.final_amount ?? null)}</td>
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

                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(r)}
                          disabled={rowBusy}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-600 text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                          title="Approve"
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
                    ) : isVerificationPending && r.tag_type === "CT" && onVerify && onRejectVerification ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onVerify(r)}
                          disabled={rowBusy}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                          title="Verify and send to Operations"
                        >
                          {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectVerification(r)}
                          disabled={rowBusy}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          title="Reject verification"
                        >
                          {rejectVerificationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
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

