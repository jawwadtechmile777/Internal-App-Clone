"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RechargeRequestRow } from "@/types/recharge";

interface SupportSubmitPaymentModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  onSubmit: (requestId: string, proofPath: string, accountId?: string | null) => Promise<void>;
}

export function SupportSubmitPaymentModal({
  open,
  onClose,
  row,
  onSubmit,
}: SupportSubmitPaymentModalProps) {
  const [proofPath, setProofPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!row || !proofPath.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(row.id, proofPath.trim(), row.payment_method_account_id);
      onClose();
      setProofPath("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!row) return null;
  const canSubmit =
    row.finance_status === "approved" &&
    row.entity_status !== "payment_submitted";

  return (
    <Modal open={open} onClose={onClose} title="Submit payment proof">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Request <span className="font-mono">{row.id.slice(0, 8)}</span>
        </p>
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        {canSubmit && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700">Payment proof URL / path</label>
              <input
                type="text"
                value={proofPath}
                onChange={(e) => setProofPath(e.target.value)}
                placeholder="e.g. https://... or storage path"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleSubmit} loading={loading} disabled={!proofPath.trim() || loading}>
              Submit
            </Button>
          </>
        )}
        {!canSubmit && (
          <p className="text-sm text-slate-500">Finance must approve before Support can submit payment.</p>
        )}
      </div>
    </Modal>
  );
}
