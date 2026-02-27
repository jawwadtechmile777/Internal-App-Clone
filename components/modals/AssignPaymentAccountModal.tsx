"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { usePaymentMethodAccounts } from "@/hooks/usePaymentMethodAccounts";
import type { RechargeRequestRow } from "@/types/recharge";

interface AssignPaymentAccountModalProps {
  open: boolean;
  row: RechargeRequestRow | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (paymentMethodAccountId: string) => void | Promise<void>;
}

export function AssignPaymentAccountModal({
  open,
  row,
  loading,
  onClose,
  onConfirm,
}: AssignPaymentAccountModalProps) {
  const paymentMethodId = row?.payment_method_id ?? null;
  const paymentMethodName = row?.payment_method?.method_name ?? null;
  const accountsQuery = usePaymentMethodAccounts(
    { paymentMethodId, paymentMethodName },
    open
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setTouched(false);
    }
  }, [open]);

  const accounts = accountsQuery.data ?? [];
  const canApprove = !!selectedId && !loading && !accountsQuery.isLoading && !accountsQuery.error;

  const warning = useMemo(() => {
    if (!row) return null;
    if (!paymentMethodId && !paymentMethodName) {
      return "This request has no payment method. Cannot assign a bank account.";
    }
    if (accountsQuery.isLoading) return null;
    if (accountsQuery.error) return "Unable to load accounts for this payment method";
    if (accounts.length === 0) return "No active accounts available for this payment method";
    return null;
  }, [row, paymentMethodId, paymentMethodName, accountsQuery.isLoading, accounts.length, accountsQuery.error]);

  if (!row) return null;

  return (
    <Modal open={open} onClose={onClose} title="Assign Payment Account">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-700 bg-slate-900/40 px-3 py-2 text-sm text-gray-300">
          Request <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span> • {row.entity?.name ?? "—"} •{" "}
          {row.player?.name ?? "—"}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Select Bank Account</label>
          <p className="mt-1 text-xs text-gray-400">
            Choose an active company account for this payment method. Default accounts are listed first.
          </p>
        </div>

        {warning ? (
          <div className="rounded-lg border border-amber-800 bg-amber-900/20 px-3 py-2 text-sm text-amber-200">
            {warning}
          </div>
        ) : null}

        {accountsQuery.error ? (
          <div className="rounded-lg border border-red-800 bg-red-900/40 px-3 py-2 text-sm text-red-300">
            {accountsQuery.error instanceof Error ? accountsQuery.error.message : "Failed to load accounts."}
          </div>
        ) : null}

        {accountsQuery.isLoading ? (
          <div className="rounded-lg border border-gray-700 bg-slate-800/50 px-4 py-8 text-center text-sm text-gray-400">
            Loading accounts...
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((a) => {
              const selected = selectedId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(a.id);
                    setTouched(true);
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-sky-600 bg-sky-900/20"
                      : "border-gray-700 bg-slate-800/40 hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-100">{a.payment_method_name ?? "Bank"}</span>
                        {a.is_default ? (
                          <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs text-gray-200">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-sm text-gray-200">Account holder: {a.holder_name || "—"}</div>
                      <div className="mt-1 text-sm text-gray-300">
                        {a.account_number ? (
                          <span>
                            Account number: <span className="text-gray-100">{a.account_number}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Account number: —</span>
                        )}
                        {a.iban ? (
                          <span className="ml-3">
                            IBAN: <span className="text-gray-100">{a.iban}</span>
                          </span>
                        ) : (
                          <span className="ml-3 text-gray-400">IBAN: —</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-1">
                      <span
                        className={`inline-flex h-4 w-4 rounded-full border ${
                          selected ? "border-sky-500 bg-sky-500" : "border-gray-500"
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {touched && !selectedId && !warning ? (
          <p className="text-xs text-red-300">Please select a bank account.</p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={!!loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setTouched(true);
              if (selectedId) void onConfirm(selectedId);
            }}
            disabled={!canApprove || !!warning}
            loading={loading}
          >
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
}

