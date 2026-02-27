"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ScreenshotPreview } from "@/components/ui/ScreenshotPreview";
import { safeParsePaymentDetails } from "@/lib/safeJson";
import { useLinkedRedeemQuery } from "@/hooks/useLinkedRedeemQuery";
import type { RechargeRequestRow } from "@/types/recharge";

interface VerificationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  loadingApprove?: boolean;
  loadingReject?: boolean;
  onApprove: () => void | Promise<void>;
  onReject: () => void;
}

function formatAmount(n: number | null | undefined): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function parseAccountDetails(details: Record<string, unknown> | null | undefined): {
  accountTitle: string | null;
  accountNumber: string | null;
} {
  if (!details) return { accountTitle: null, accountNumber: null };
  const d = safeParsePaymentDetails(details);
  return {
    accountTitle:
      (d["account_title"] as string | undefined) ??
      (d["account_name"] as string | undefined) ??
      (d["holder_name"] as string | undefined) ??
      (d["name"] as string | undefined) ??
      null,
    accountNumber:
      (d["account_number"] as string | undefined) ??
      (d["mobile_number"] as string | undefined) ??
      (d["mobile"] as string | undefined) ??
      (d["phone_number"] as string | undefined) ??
      (d["iban"] as string | undefined) ??
      null,
  };
}

export function VerificationDetailsModal({
  open,
  onClose,
  row,
  loadingApprove,
  loadingReject,
  onApprove,
  onReject,
}: VerificationDetailsModalProps) {
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (open) setApproving(false);
  }, [open]);

  const redeemQuery = useLinkedRedeemQuery(open && row?.pt_redeem_id ? row.pt_redeem_id : null);

  if (!row) return null;

  const canAct = row.verification_status === "pending" && row.entity_status === "payment_submitted";
  const hasProof = !!row.entity_payment_proof_path;
  const isLoading = loadingApprove || loadingReject || approving;

  const rechargePlayerAccount = row.payment_method
    ? { methodName: row.payment_method.method_name, ...parseAccountDetails(row.payment_method.details) }
    : null;

  const redeem = redeemQuery.data ?? null;
  const redeemPlayer = redeem?.player ?? null;
  const redeemPaymentMethod = redeem?.payment_method ?? row.pt_payment_method ?? null;
  const redeemAccount = redeemPaymentMethod
    ? { methodName: redeemPaymentMethod.method_name, ...parseAccountDetails(redeemPaymentMethod.details) }
    : null;

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Verify Payment — PT Recharge">
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Request header */}
        <div className="rounded-lg border border-gray-700 bg-slate-900/40 px-3 py-2 text-sm text-gray-300">
          <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span>
          {" • "}{row.entity?.name ?? "—"}
          {" • Tag: "}<span className="text-sky-300">{row.tag_type ?? "—"}</span>
        </div>

        {/* Recharge Player Details */}
        <div className="rounded-lg border border-gray-700 bg-slate-900/30 px-4 py-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Recharge Player</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-gray-500">Player Name</dt>
            <dd className="text-gray-100">{row.player?.name ?? "—"}</dd>
            <dt className="text-gray-500">Entity</dt>
            <dd className="text-gray-100">{row.entity?.name ?? "—"}</dd>
            <dt className="text-gray-500">Game</dt>
            <dd className="text-gray-100">{row.game?.name ?? "—"}</dd>
            <dt className="text-gray-500">Amount</dt>
            <dd className="text-gray-100 tabular-nums">{formatAmount(row.amount)}</dd>
            <dt className="text-gray-500">Bonus</dt>
            <dd className="text-gray-100 tabular-nums">
              {Number(row.bonus_percentage ?? 0) > 0
                ? `${row.bonus_percentage}%`
                : formatAmount(row.bonus_amount)}
            </dd>
            <dt className="text-gray-500">Final Amount</dt>
            <dd className="text-gray-100 tabular-nums font-medium">{formatAmount(row.final_amount)}</dd>
          </dl>
          {rechargePlayerAccount ? (
            <div className="mt-1 border-t border-gray-700/50 pt-2 text-sm space-y-0.5">
              <div className="text-gray-400">Method: <span className="text-gray-200">{rechargePlayerAccount.methodName}</span></div>
              {rechargePlayerAccount.accountTitle ? (
                <div className="text-gray-400">Account Title: <span className="text-gray-200">{rechargePlayerAccount.accountTitle}</span></div>
              ) : null}
              {rechargePlayerAccount.accountNumber ? (
                <div className="text-gray-400">Account No: <span className="text-gray-200">{rechargePlayerAccount.accountNumber}</span></div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Redeem Player Details (PT linked) */}
        <div className="rounded-lg border border-gray-700 bg-slate-900/30 px-4 py-3 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-400">Redeem Player (PT Tag)</h4>
          {redeemQuery.isLoading ? (
            <p className="text-sm text-gray-400">Loading redeem details...</p>
          ) : redeemPlayer ? (
            <>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-gray-500">Player Name</dt>
                <dd className="text-gray-100">{redeemPlayer.name}</dd>
                {redeem ? (
                  <>
                    <dt className="text-gray-500">Redeem Total</dt>
                    <dd className="text-gray-100 tabular-nums">{formatAmount(redeem.total_amount)}</dd>
                    <dt className="text-gray-500">Hold Amount</dt>
                    <dd className="text-gray-100 tabular-nums">{formatAmount(redeem.hold_amount)}</dd>
                    <dt className="text-gray-500">Remaining</dt>
                    <dd className="text-gray-100 tabular-nums">{formatAmount(redeem.remaining_amount)}</dd>
                  </>
                ) : null}
              </dl>
              {redeemAccount ? (
                <div className="mt-1 border-t border-gray-700/50 pt-2 text-sm space-y-0.5">
                  <div className="text-gray-400">Method: <span className="text-gray-200">{redeemAccount.methodName}</span></div>
                  {redeemAccount.accountTitle ? (
                    <div className="text-gray-400">Account Title: <span className="text-gray-200">{redeemAccount.accountTitle}</span></div>
                  ) : null}
                  {redeemAccount.accountNumber ? (
                    <div className="text-gray-400">Account No: <span className="text-gray-200">{redeemAccount.accountNumber}</span></div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : row.pt_redeem_id ? (
            <p className="text-sm text-amber-300">Could not load linked redeem data.</p>
          ) : (
            <p className="text-sm text-gray-500">No linked redeem request.</p>
          )}
        </div>

        {/* Payment Screenshot */}
        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-300">Payment Screenshot</h3>
          {hasProof ? (
            <ScreenshotPreview url={row.entity_payment_proof_path} />
          ) : (
            <div className="rounded-lg border border-gray-700 bg-slate-900/30 px-4 py-6 text-center text-sm text-gray-500">
              No payment screenshot uploaded.
            </div>
          )}
        </div>

        {/* Remarks */}
        {row.remarks ? (
          <div className="text-sm">
            <span className="text-gray-500">Remarks: </span>
            <span className="text-gray-200">{row.remarks}</span>
          </div>
        ) : null}

        {/* Actions */}
        {canAct ? (
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-700/50">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={isLoading} loading={loadingReject}>
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isLoading || !hasProof}
              loading={loadingApprove || approving}
            >
              {hasProof ? "Verify & Send to Operations" : "Screenshot Required"}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end pt-2 border-t border-gray-700/50">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
