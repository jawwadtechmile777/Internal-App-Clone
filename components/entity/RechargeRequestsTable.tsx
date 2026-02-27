"use client";

import { safeParsePaymentDetails } from "@/lib/safeJson";
import { StatusBadge } from "@/components/entity/StatusBadge";
import type { RechargeRequestRow } from "@/types/recharge";

interface RechargeRequestsTableProps {
  rows: RechargeRequestRow[];
  loading?: boolean;
  emptyMessage?: string;
  /** Show submit-payment action (Support/Entity context). */
  showSubmitPayment?: boolean;
  onView: (row: RechargeRequestRow) => void;
  onSubmitPayment: (row: RechargeRequestRow) => void;
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

  if (r.entity_status === "payment_submitted") return "Payment Submitted";

  if (r.finance_status === "verified") return "Finance Verified";
  if (r.finance_status === "verification_pending") return "Waiting Finance Verification";
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

function EyeIcon({ className = "" }: { className?: string }) {
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
        d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.657 15 15 13.657 15 12C15 10.343 13.657 9 12 9C10.343 9 9 10.343 9 12C9 13.657 10.343 15 12 15Z"
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
  loading,
  emptyMessage = "No recharge requests for this entity.",
  showSubmitPayment = false,
  onView,
  onSubmitPayment,
}: RechargeRequestsTableProps) {
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
            const canSubmit =
              showSubmitPayment &&
              r.finance_status === "approved" &&
              !r.entity_payment_submitted_at;
            const status = computeStatus(r);
            return (
              <tr key={r.id} className="hover:bg-slate-700/40">
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
                <td className="px-4 py-3 text-gray-400">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(r)}
                      className="inline-flex items-center gap-1 rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <EyeIcon />
                      View
                    </button>
                    {showSubmitPayment && (
                      <button
                        type="button"
                        onClick={() => canSubmit && onSubmitPayment(r)}
                        disabled={!canSubmit}
                        title={canSubmit ? "Submit payment proof" : "Finance must approve first"}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                          canSubmit
                            ? "bg-emerald-700 text-white hover:bg-emerald-600"
                            : "bg-slate-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                        }`}
                      >
                        <SubmitIcon />
                        Submit Payment
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

