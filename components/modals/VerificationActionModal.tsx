"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RechargeRequestRow } from "@/types/recharge";

interface VerificationActionModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, remarks?: string) => Promise<void>;
}

export function VerificationActionModal({
  open,
  onClose,
  row,
  onApprove,
  onReject,
}: VerificationActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const handleApprove = async () => {
    if (!row) return;
    setLoading(true);
    setError(null);
    try {
      await onApprove(row.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!row) return;
    setLoading(true);
    setError(null);
    try {
      await onReject(row.id, rejectRemarks || undefined);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!row) return null;
  const canAct = row.tag_type === "PT" && row.verification_status === "pending";

  return (
    <Modal open={open} onClose={onClose} title="Verification action">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Request <span className="font-mono">{row.id.slice(0, 8)}</span> — {row.entity?.name} / {row.player?.name}
        </p>
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        {canAct && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleApprove} loading={loading} disabled={loading}>
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject} loading={loading} disabled={loading}>
                Reject
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Reject remarks (optional)</label>
              <textarea
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          </>
        )}
        {!canAct && (
          <p className="text-sm text-slate-500">This request is not pending verification (PT).</p>
        )}
      </div>
    </Modal>
  );
}
