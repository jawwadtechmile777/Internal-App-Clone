"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import * as storageService from "@/services/storageService";
import * as supportService from "@/services/supportService";
import type { RechargeRequestRow } from "@/types/recharge";

interface UploadPaymentProofModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  onSubmitted: () => void | Promise<void>;
}

export function UploadPaymentProofModal({ open, onClose, row, onSubmitted }: UploadPaymentProofModalProps) {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setNotes("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    if (!row) return false;
    if (row.finance_status !== "approved") return false;
    if (row.entity_payment_submitted_at) return false;
    return !!file && !loading;
  }, [row, file, loading]);

  const handleSubmit = async () => {
    if (!row || !file) return;
    setLoading(true);
    setError(null);
    try {
      const upload = await storageService.uploadPaymentProof({ requestId: row.id, file });
      await supportService.supportSubmitPaymentProof(
        row.id,
        upload.publicUrl,
        row.payment_method_account_id,
        notes.trim() ? notes.trim() : null
      );
      showToast({ variant: "success", title: "Payment submitted", description: "Payment proof uploaded successfully." });
      onClose();
      await onSubmitted();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      showToast({ variant: "error", title: "Upload failed", description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!row) return null;

  return (
    <Modal open={open} onClose={onClose} title="Upload Payment Proof">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-700 bg-slate-900/40 px-3 py-2 text-sm text-gray-300">
          Request <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span> • {row.entity?.name ?? "—"} •{" "}
          {row.player?.name ?? "—"}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-800 bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-gray-200">Payment Screenshot (required)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border file:border-gray-700 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-gray-100 hover:file:bg-slate-700"
            disabled={loading}
          />
          {!file ? <p className="mt-1 text-xs text-gray-400">Accepted: JPG/PNG/WEBP</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Optional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Any additional info for finance…"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit} loading={loading}>
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

