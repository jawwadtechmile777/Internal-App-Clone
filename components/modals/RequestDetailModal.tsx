"use client";

import { Modal } from "@/components/ui/Modal";
import type { AppRequestRow } from "@/types/request";

interface RequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  row: AppRequestRow | null;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function formatAmount(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export function RequestDetailModal({ open, onClose, row }: RequestDetailModalProps) {
  if (!row) return null;

  return (
    <Modal open={open} onClose={onClose} title="Request details">
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-gray-100">{row.id}</dd>
          <dt className="text-gray-500">Type</dt>
          <dd className="text-gray-100">{row.type}</dd>
          <dt className="text-gray-500">Entity</dt>
          <dd className="text-gray-100">{row.entity?.name ?? row.entity_id}</dd>
          <dt className="text-gray-500">Player</dt>
          <dd className="text-gray-100">{row.player?.name ?? row.player_id}</dd>
          <dt className="text-gray-500">Amount</dt>
          <dd className="text-gray-100">{formatAmount(row.amount)}</dd>
          <dt className="text-gray-500">Status</dt>
          <dd className="text-gray-100">{row.status ?? "—"}</dd>
          <dt className="text-gray-500">Created</dt>
          <dd className="text-gray-100">{formatDate(row.created_at)}</dd>
        </dl>

        {(row.source_game || row.target_game) && (
          <div className="rounded-lg border border-gray-700 bg-slate-900 p-3 text-sm text-gray-300">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Source game:</span> {row.source_game?.name ?? "—"}
              </div>
              <div>
                <span className="text-gray-500">Target game:</span> {row.target_game?.name ?? "—"}
              </div>
            </div>
          </div>
        )}

        {row.remarks && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-300">Remarks</h3>
            <p className="text-sm text-gray-400">{row.remarks}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

