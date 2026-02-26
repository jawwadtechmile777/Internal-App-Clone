"use client";

import { Modal } from "@/components/ui/Modal";
import { ScreenshotPreview } from "@/components/ui/ScreenshotPreview";
import { safeParsePaymentDetails } from "@/lib/safeJson";
import type { RechargeRequestRow } from "@/types/recharge";

interface RechargeDetailModalProps {
  open: boolean;
  onClose: () => void;
  row: RechargeRequestRow | null;
}

function formatDate(iso: string | null): string {
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

export function RechargeDetailModal({ open, onClose, row }: RechargeDetailModalProps) {
  if (!row) return null;

  const details = safeParsePaymentDetails(row.payment_method?.details);

  return (
    <Modal open={open} onClose={onClose} title="Recharge request details">
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-gray-100">{row.id}</dd>
          <dt className="text-gray-500">Entity</dt>
          <dd className="text-gray-100">{row.entity?.name ?? row.entity_id}</dd>
          <dt className="text-gray-500">Player</dt>
          <dd className="text-gray-100">{row.player?.name ?? row.player_id}</dd>
          <dt className="text-gray-500">Amount</dt>
          <dd className="text-gray-100">{formatAmount(row.amount)}</dd>
          <dt className="text-gray-500">Bonus %</dt>
          <dd className="text-gray-100">{row.bonus_percentage}%</dd>
          <dt className="text-gray-500">Final amount</dt>
          <dd className="text-gray-100">{formatAmount(row.final_amount)}</dd>
          <dt className="text-gray-500">Tag</dt>
          <dd className="text-gray-100">{row.tag_type ?? "—"}</dd>
          <dt className="text-gray-500">Entity status</dt>
          <dd className="text-gray-100">{row.entity_status ?? "—"}</dd>
          <dt className="text-gray-500">Finance status</dt>
          <dd className="text-gray-100">{row.finance_status ?? "—"}</dd>
          <dt className="text-gray-500">Verification status</dt>
          <dd className="text-gray-100">{row.verification_status}</dd>
          <dt className="text-gray-500">Operations status</dt>
          <dd className="text-gray-100">{row.operations_status ?? "—"}</dd>
          <dt className="text-gray-500">Created</dt>
          <dd className="text-gray-100">{formatDate(row.created_at)}</dd>
          {row.entity_payment_submitted_at && (
            <>
              <dt className="text-gray-500">Payment submitted</dt>
              <dd className="text-gray-100">{formatDate(row.entity_payment_submitted_at)}</dd>
            </>
          )}
        </dl>
        {row.payment_method_account && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-300">Payment account</h3>
            <p className="text-sm text-gray-400">
              {row.payment_method_account.account_name} — {row.payment_method_account.account_number}
              {row.payment_method_account.iban && ` (${row.payment_method_account.iban})`}
            </p>
            <p className="text-sm text-gray-400">{row.payment_method_account.holder_name}</p>
          </div>
        )}
        {Object.keys(details).length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-300">Payment method details</h3>
            <pre className="max-h-32 overflow-auto rounded bg-slate-900 p-2 text-xs text-gray-300 border border-gray-700">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
        {row.remarks && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-300">Remarks</h3>
            <p className="text-sm text-gray-400">{row.remarks}</p>
          </div>
        )}
        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-300">Payment proof</h3>
          <ScreenshotPreview url={row.entity_payment_proof_path} />
        </div>
      </div>
    </Modal>
  );
}
