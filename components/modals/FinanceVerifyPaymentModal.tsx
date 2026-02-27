"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ScreenshotPreview } from "@/components/ui/ScreenshotPreview";
import type { RechargeRequestRow } from "@/types/recharge";

interface FinanceVerifyPaymentModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  loading?: boolean;
  onApprove: () => void | Promise<void>;
  onReject: () => void;
}

function formatAmount(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function tagSummary(r: RechargeRequestRow): string {
  if (!r.tag_type) return "—";
  if (r.tag_type === "CT") {
    const acct = r.payment_method_account;
    if (!acct) return "CT";
    return `CT • ${acct.account_name} • ${acct.account_number}`;
  }
  const pt = r.pt_payment_method;
  if (!pt) return "PT";
  return `PT • ${pt.method_name}`;
}

export function FinanceVerifyPaymentModal({
  open,
  onClose,
  row,
  loading,
  onApprove,
  onReject,
}: FinanceVerifyPaymentModalProps) {
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (open) setApproving(false);
  }, [open]);

  if (!row) return null;

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  const isLoading = loading || approving;

  return (
    <Modal open={open} onClose={onClose} title="Verify Payment">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-700 bg-slate-900/40 px-3 py-2 text-sm text-gray-300">
          <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span>
          {" • "}{row.entity?.name ?? "—"}{" • "}{row.player?.name ?? "—"}
        </div>

        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-300">Payment Screenshot</h3>
          <ScreenshotPreview url={row.entity_payment_proof_path} />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">Amount</dt>
          <dd className="text-gray-100 tabular-nums">{formatAmount(row.amount)}</dd>
          <dt className="text-gray-500">Final Amount</dt>
          <dd className="text-gray-100 tabular-nums">{formatAmount(row.final_amount)}</dd>
          <dt className="text-gray-500">Tag</dt>
          <dd className="text-gray-100">{tagSummary(row)}</dd>
          {row.remarks ? (
            <>
              <dt className="text-gray-500">Remarks</dt>
              <dd className="text-gray-100">{row.remarks}</dd>
            </>
          ) : null}
        </dl>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onReject} disabled={isLoading}>
            Reject
          </Button>
          <Button variant="primary" onClick={handleApprove} loading={isLoading} disabled={isLoading}>
            Approve &amp; Send to Operations
          </Button>
        </div>
      </div>
    </Modal>
  );
}
