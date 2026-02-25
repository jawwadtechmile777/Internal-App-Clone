"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RechargeRequestRow } from "@/types/recharge";

interface FinanceApproveModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
  onApproveCT: (id: string) => Promise<void>;
  onApprovePT: (id: string) => Promise<void>;
  onReject: (id: string, remarks?: string) => Promise<void>;
}

export function FinanceApproveModal({
  open,
  onClose,
  row,
  onApproveCT,
  onApprovePT,
  onReject,
}: FinanceApproveModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const handleApproveCT = async () => {
    if (!row) return;
    setLoading(true);
    setError(null);
    try {
      await onApproveCT(row.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePT = async () => {
    if (!row) return;
    setLoading(true);
    setError(null);
    try {
      await onApprovePT(row.id);
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
  const isPending = row.finance_status === "pending";

  return (
    <Modal open={open} onClose={onClose} title="Finance action">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Request <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span> — {row.entity?.name} / {row.player?.name}
        </p>
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-300">{error}</div>
        )}
        {isPending && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleApproveCT} loading={loading} disabled={loading}>
              Approve (CT)
            </Button>
            <Button variant="secondary" onClick={handleApprovePT} loading={loading} disabled={loading}>
              Approve (PT)
            </Button>
            <Button variant="destructive" onClick={handleReject} loading={loading} disabled={loading}>
              Reject
            </Button>
          </div>
        )}
        {isPending && (
          <div>
            <label className="block text-sm font-medium text-gray-300">Reject remarks (optional)</label>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              rows={2}
            />
          </div>
        )}
        {!isPending && (
          <p className="text-sm text-gray-500">This request is not pending finance approval.</p>
        )}
      </div>
    </Modal>
  );
}
