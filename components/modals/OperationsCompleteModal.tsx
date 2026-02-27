"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RechargeRequestRow } from "@/types/recharge";

interface OperationsCompleteModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

function formatAmount(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export function OperationsCompleteModal({
  open,
  onClose,
  row,
  loading,
  onConfirm,
}: OperationsCompleteModalProps) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSubmitting(false);
  }, [open]);

  if (!row) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <Modal open={open} onClose={onClose} title="Complete Recharge?">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          This will finalize the recharge and mark all statuses as completed.
        </p>

        <div className="rounded-lg border border-gray-700 bg-slate-900/40 px-3 py-2 text-sm text-gray-300">
          <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span>
          {" • "}{row.entity?.name ?? "—"}
          {" • "}{row.player?.name ?? "—"}
          {" • "}{formatAmount(row.final_amount ?? row.amount)}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={isLoading} disabled={isLoading}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
