"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RedeemRequestRow } from "@/types/redeem";

interface Props {
  open: boolean;
  onClose: () => void;
  row: RedeemRequestRow | null;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

function fmt(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export function VerificationVerifyRedeemModal({ open, onClose, row, loading, onConfirm }: Props) {
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

  const busy = loading || submitting;

  return (
    <Modal open={open} onClose={onClose} title="Verify Redeem Request">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Are you sure you want to verify this redeem request? It will be sent to the Finance department for payment.
        </p>

        <div className="space-y-2 rounded-lg border border-gray-700 bg-slate-900/40 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Player</span>
            <span className="text-gray-100">{row.player?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entity</span>
            <span className="text-gray-100">{row.entity?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Game</span>
            <span className="text-gray-100">{row.game?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Amount</span>
            <span className="font-mono text-gray-100">{fmt(row.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining Amount</span>
            <span className="font-mono text-emerald-300">{fmt(row.remaining_amount)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={busy} disabled={busy}>
            Verify
          </Button>
        </div>
      </div>
    </Modal>
  );
}
