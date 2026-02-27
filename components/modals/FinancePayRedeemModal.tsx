"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { RedeemRequestRow } from "@/types/redeem";
import { safeParsePaymentDetails } from "@/lib/safeJson";

interface Props {
  open: boolean;
  onClose: () => void;
  row: RedeemRequestRow | null;
  loading?: boolean;
  onConfirm: (amount: number) => void | Promise<void>;
}

function fmt(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function accountInfo(row: RedeemRequestRow): string {
  const pm = row.payment_method;
  if (!pm) return "—";
  const d = safeParsePaymentDetails(pm.details);
  const acctNum =
    (d["account_number"] as string | undefined) ??
    (d["mobile_number"] as string | undefined) ??
    (d["mobile"] as string | undefined) ??
    (d["phone_number"] as string | undefined) ??
    (d["iban"] as string | undefined) ??
    undefined;
  const title = (d["account_title"] as string | undefined) ?? undefined;
  const parts = [pm.method_name];
  if (title) parts.push(title);
  if (acctNum) parts.push(acctNum);
  return parts.join(" • ");
}

export function FinancePayRedeemModal({ open, onClose, row, loading, onConfirm }: Props) {
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setTouched(false);
      setSubmitting(false);
    }
  }, [open]);

  if (!row) return null;

  const numAmount = parseFloat(amount);
  const isValidNumber = !isNaN(numAmount) && Number.isFinite(numAmount);
  const isPositive = isValidNumber && numAmount > 0;
  const withinLimit = isValidNumber && numAmount <= row.remaining_amount;
  const canSubmit = isPositive && withinLimit;

  const errorMsg = touched
    ? !amount.trim()
      ? "Payment amount is required"
      : !isValidNumber
        ? "Enter a valid number"
        : !isPositive
          ? "Amount must be greater than 0"
          : !withinLimit
            ? `Amount cannot exceed remaining (${fmt(row.remaining_amount)})`
            : null
    : null;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onConfirm(numAmount);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;

  const previewPaid = canSubmit ? row.paid_amount + numAmount : row.paid_amount;
  const previewRemaining = canSubmit ? row.total_amount - previewPaid : row.remaining_amount;
  const willComplete = canSubmit && previewRemaining === 0;

  return (
    <Modal open={open} onClose={onClose} title="Process Payment">
      <div className="space-y-4">
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
            <span className="text-gray-400">Account</span>
            <span className="text-gray-100">{accountInfo(row)}</span>
          </div>
          <hr className="border-gray-700" />
          <div className="flex justify-between">
            <span className="text-gray-400">Total Amount</span>
            <span className="font-mono text-gray-100">{fmt(row.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Already Paid</span>
            <span className="font-mono text-gray-100">{fmt(row.paid_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Remaining</span>
            <span className="font-mono text-emerald-300">{fmt(row.remaining_amount)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Payment Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={row.remaining_amount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched(true)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder={`Max ${fmt(row.remaining_amount)}`}
          />
          {errorMsg && <p className="mt-1 text-xs text-red-300">{errorMsg}</p>}
        </div>

        {canSubmit && (
          <div className="space-y-1 rounded-lg border border-gray-700 bg-slate-900/40 px-4 py-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">After payment</p>
            <div className="flex justify-between">
              <span className="text-gray-400">Paid</span>
              <span className="font-mono text-gray-100">{fmt(previewPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Remaining</span>
              <span className={`font-mono ${previewRemaining === 0 ? "text-emerald-400" : "text-amber-300"}`}>
                {fmt(previewRemaining)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Result</span>
              <span className={`text-xs font-semibold uppercase ${willComplete ? "text-emerald-400" : "text-amber-300"}`}>
                {willComplete ? "Fully Completed" : "Partially Completed"}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={busy}
            disabled={!canSubmit || busy}
          >
            {willComplete ? "Pay & Complete" : "Pay"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
