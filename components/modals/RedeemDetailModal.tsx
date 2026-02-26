"use client";

import { Modal } from "@/components/ui/Modal";
import type { RedeemRequestRow } from "@/types/redeem";

interface RedeemDetailModalProps {
  open: boolean;
  onClose: () => void;
  row: RedeemRequestRow | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function formatAmount(n: number): string {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export function RedeemDetailModal({ open, onClose, row }: RedeemDetailModalProps) {
  if (!row) return null;

  return (
    <Modal open={open} onClose={onClose} title="Redeem request details">
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-gray-100">{row.id}</dd>
          <dt className="text-gray-500">Entity</dt>
          <dd className="text-gray-100">{row.entity?.name ?? row.entity_id}</dd>
          <dt className="text-gray-500">Player</dt>
          <dd className="text-gray-100">{row.player?.name ?? row.player_id}</dd>
          <dt className="text-gray-500">Total</dt>
          <dd className="text-gray-100">{formatAmount(row.total_amount)}</dd>
          <dt className="text-gray-500">Remaining</dt>
          <dd className="text-gray-100">{formatAmount(row.remaining_amount)}</dd>
          <dt className="text-gray-500">Flow</dt>
          <dd className="text-gray-100">{row.flow_type}</dd>
          <dt className="text-gray-500">Status</dt>
          <dd className="text-gray-100">{row.status ?? "—"}</dd>
          <dt className="text-gray-500">Created</dt>
          <dd className="text-gray-100">{formatDate(row.created_at)}</dd>
        </dl>

        <div className="rounded-lg border border-gray-700 bg-slate-900 p-3 text-sm text-gray-300">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Support:</span> {row.support_status ?? "—"}
            </div>
            <div>
              <span className="text-gray-500">Finance:</span> {row.finance_status ?? "—"}
            </div>
            <div>
              <span className="text-gray-500">Verification:</span> {row.verification_status ?? "—"}
            </div>
            <div>
              <span className="text-gray-500">Operations:</span> {row.operations_status ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

