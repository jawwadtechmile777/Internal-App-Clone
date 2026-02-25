"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ScreenshotPreview } from "@/components/ui/ScreenshotPreview";
import type { RechargeRequestRow } from "@/types/recharge";

interface FinanceVerifyModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  onVerifyAndSendToOperations: (id: string) => Promise<void>;
}

export function FinanceVerifyModal({
  open,
  onClose,
  row,
  onVerifyAndSendToOperations,
}: FinanceVerifyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!row) return;
    setLoading(true);
    setError(null);
    try {
      await onVerifyAndSendToOperations(row.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!row) return null;
  const canVerify =
    row.tag_type === "CT" &&
    row.finance_status === "approved" &&
    row.entity_status === "payment_submitted";

  return (
    <Modal open={open} onClose={onClose} title="Finance verify (CT flow)">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Request <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span>
        </p>
        <ScreenshotPreview url={row.entity_payment_proof_path} />
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-300">{error}</div>
        )}
        {canVerify ? (
          <Button onClick={handleVerify} loading={loading}>
            Verify and send to Operations
          </Button>
        ) : (
          <p className="text-sm text-gray-500">
            Only CT requests with payment submitted can be verified here.
          </p>
        )}
      </div>
    </Modal>
  );
}
