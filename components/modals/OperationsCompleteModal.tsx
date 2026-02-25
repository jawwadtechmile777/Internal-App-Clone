"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RechargeRequestRow } from "@/types/recharge";

interface OperationsCompleteModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  onComplete: (id: string) => Promise<void>;
}

export function OperationsCompleteModal({
  open,
  onClose,
  row,
  onComplete,
}: OperationsCompleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!row) return;
    setLoading(true);
    setError(null);
    try {
      await onComplete(row.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!row) return null;
  const canComplete = row.operations_status === "waiting_operations";

  return (
    <Modal open={open} onClose={onClose} title="Mark complete">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Request <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span> — {row.entity?.name} / {row.player?.name}
        </p>
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-300">{error}</div>
        )}
        {canComplete ? (
          <Button onClick={handleComplete} loading={loading}>
            Mark as completed
          </Button>
        ) : (
          <p className="text-sm text-gray-500">Only requests in waiting_operations can be completed.</p>
        )}
      </div>
    </Modal>
  );
}
