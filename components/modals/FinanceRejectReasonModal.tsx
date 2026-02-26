"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface FinanceRejectReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  loading?: boolean;
}

export function FinanceRejectReasonModal({
  open,
  onClose,
  onConfirm,
  loading,
}: FinanceRejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setTouched(false);
    }
  }, [open]);

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= 3;

  return (
    <Modal open={open} onClose={onClose} title="Reject recharge request">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Please provide a rejection reason. This will be saved in the request remarks and shown in history.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-200">Rejection reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="e.g. invalid amount, wrong player, missing details…"
          />
          {touched && !canSubmit ? (
            <p className="mt-1 text-xs text-red-300">Reason must be at least 3 characters.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={!!loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onConfirm(trimmed)}
            disabled={!canSubmit || !!loading}
            loading={loading}
          >
            Reject
          </Button>
        </div>
      </div>
    </Modal>
  );
}

