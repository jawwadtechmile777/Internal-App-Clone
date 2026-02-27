"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { usePaymentMethodAccounts } from "@/hooks/usePaymentMethodAccounts";
import { useEligiblePTRedeems } from "@/hooks/useEligiblePTRedeems";
import { safeParsePaymentDetails } from "@/lib/safeJson";
import type { RechargeRequestRow } from "@/types/recharge";
import type { RedeemRequestRow } from "@/types/redeem";

type TagTab = "ct" | "pt";

interface AssignPaymentAccountModalProps {
  open: boolean;
  row: RechargeRequestRow | null;
  loading?: boolean;
  onClose: () => void;
  onConfirmCT: (paymentMethodAccountId: string) => void | Promise<void>;
  onConfirmPT: (redeemId: string) => void | Promise<void>;
}

function formatAmount(n: number | null | undefined): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function redeemAccountInfo(r: RedeemRequestRow): {
  methodName: string;
  accountTitle: string | null;
  accountNumber: string | null;
} {
  const pm = r.payment_method;
  if (!pm) return { methodName: "—", accountTitle: null, accountNumber: null };
  const d = safeParsePaymentDetails(pm.details);

  const accountTitle =
    (d["account_title"] as string | undefined) ??
    (d["account_name"] as string | undefined) ??
    (d["holder_name"] as string | undefined) ??
    (d["name"] as string | undefined) ??
    null;

  const accountNumber =
    (d["account_number"] as string | undefined) ??
    (d["mobile_number"] as string | undefined) ??
    (d["mobile"] as string | undefined) ??
    (d["phone_number"] as string | undefined) ??
    (d["phone"] as string | undefined) ??
    (d["iban"] as string | undefined) ??
    (d["username"] as string | undefined) ??
    (d["upi"] as string | undefined) ??
    null;

  return { methodName: pm.method_name, accountTitle, accountNumber };
}

export function AssignPaymentAccountModal({
  open,
  row,
  loading,
  onClose,
  onConfirmCT,
  onConfirmPT,
}: AssignPaymentAccountModalProps) {
  const paymentMethodId = row?.payment_method_id ?? null;
  const paymentMethodName = row?.payment_method?.method_name ?? null;
  const entityId = row?.entity_id ?? null;
  const rechargeAmount = row?.amount ?? 0;

  const accountsQuery = usePaymentMethodAccounts(
    { paymentMethodId, paymentMethodName },
    open
  );
  const ptQuery = useEligiblePTRedeems(entityId, open);

  const [tab, setTab] = useState<TagTab>("ct");
  const [selectedCTId, setSelectedCTId] = useState<string | null>(null);
  const [selectedPTId, setSelectedPTId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setTab("ct");
      setSelectedCTId(null);
      setSelectedPTId(null);
      setTouched(false);
    }
  }, [open]);

  const accounts = accountsQuery.data ?? [];
  const eligibleRedeems = ptQuery.data ?? [];

  const canApproveCT = tab === "ct" && !!selectedCTId && !loading && !accountsQuery.isLoading;
  const canApprovePT = tab === "pt" && !!selectedPTId && !loading && !ptQuery.isLoading;

  const ctWarning = useMemo(() => {
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

  const handleApprove = () => {
    setTouched(true);
    if (tab === "ct" && selectedCTId) void onConfirmCT(selectedCTId);
    if (tab === "pt" && selectedPTId) void onConfirmPT(selectedPTId);
  };

  return (
    <Modal open={open} onClose={onClose} title="Approve Recharge Request">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-700 bg-slate-900/40 px-3 py-2 text-sm text-gray-300">
          Request <span className="font-mono text-gray-100">{row.id.slice(0, 8)}</span>
          {" • "}{row.entity?.name ?? "—"}
          {" • "}{row.player?.name ?? "—"}
          {" • "}{formatAmount(row.amount)}
        </div>

        {/* Tag type tabs */}
        <div className="flex border-b border-gray-700">
          <button
            type="button"
            onClick={() => setTab("ct")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === "ct"
                ? "text-gray-100 border-slate-400"
                : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
            }`}
          >
            CT Tags
          </button>
          <button
            type="button"
            onClick={() => setTab("pt")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === "pt"
                ? "text-gray-100 border-slate-400"
                : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
            }`}
          >
            PT Tags
          </button>
        </div>

        {/* CT Tab */}
        {tab === "ct" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">Select Bank Account</label>
              <p className="mt-1 text-xs text-gray-400">
                Choose an active company account for this payment method.
              </p>
            </div>

            {ctWarning ? (
              <div className="rounded-lg border border-amber-800 bg-amber-900/20 px-3 py-2 text-sm text-amber-200">
                {ctWarning}
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
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {accounts.map((a) => {
                  const selected = selectedCTId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setSelectedCTId(a.id); setTouched(true); }}
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
                          <div className="mt-1 text-sm text-gray-200">Holder: {a.holder_name || "—"}</div>
                          <div className="mt-1 text-sm text-gray-300">
                            {a.account_number ? (
                              <span>Acc: <span className="text-gray-100">{a.account_number}</span></span>
                            ) : (
                              <span className="text-gray-400">Acc: —</span>
                            )}
                            {a.iban ? (
                              <span className="ml-3">IBAN: <span className="text-gray-100">{a.iban}</span></span>
                            ) : null}
                          </div>
                        </div>
                        <span
                          className={`mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border ${
                            selected ? "border-sky-500 bg-sky-500" : "border-gray-500"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : (
          /* PT Tab */
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">Select PT Tag (Redeem Request)</label>
              <p className="mt-1 text-xs text-gray-400">
                Match this recharge with an eligible redeem request from the same entity.
                Redeem remaining must be &ge; recharge amount ({formatAmount(rechargeAmount)}).
              </p>
            </div>

            {ptQuery.error ? (
              <div className="rounded-lg border border-red-800 bg-red-900/40 px-3 py-2 text-sm text-red-300">
                {ptQuery.error instanceof Error ? ptQuery.error.message : "Failed to load redeems."}
              </div>
            ) : null}

            {ptQuery.isLoading ? (
              <div className="rounded-lg border border-gray-700 bg-slate-800/50 px-4 py-8 text-center text-sm text-gray-400">
                Loading eligible redeems...
              </div>
            ) : eligibleRedeems.length === 0 ? (
              <div className="rounded-lg border border-amber-800 bg-amber-900/20 px-4 py-6 text-center text-sm text-amber-200">
                No PT tags available for this entity.
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {eligibleRedeems.map((rd) => {
                  const canSelect = rd.remaining_amount >= rechargeAmount;
                  const selected = selectedPTId === rd.id;
                  return (
                    <button
                      key={rd.id}
                      type="button"
                      disabled={!canSelect}
                      onClick={() => { if (canSelect) { setSelectedPTId(rd.id); setTouched(true); } }}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        !canSelect
                          ? "cursor-not-allowed border-gray-800 bg-slate-900/30 opacity-50"
                          : selected
                            ? "border-sky-600 bg-sky-900/20"
                            : "border-gray-700 bg-slate-800/40 hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-gray-400">{rd.id.slice(0, 8)}</span>
                            <span className="text-sm font-medium text-gray-100">{rd.player?.name ?? "—"}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="text-gray-400">
                              Total: <span className="text-gray-100 tabular-nums">{formatAmount(rd.total_amount)}</span>
                            </span>
                            <span className="text-gray-400">
                              Remaining: <span className={`tabular-nums ${canSelect ? "text-emerald-300" : "text-red-300"}`}>
                                {formatAmount(rd.remaining_amount)}
                              </span>
                            </span>
                            <span className="text-gray-400">
                              Hold: <span className="text-gray-100 tabular-nums">{formatAmount(rd.hold_amount)}</span>
                            </span>
                          </div>
                          {(() => {
                            const info = redeemAccountInfo(rd);
                            return (
                              <div className="space-y-0.5 text-xs">
                                <div className="text-gray-400">
                                  Method: <span className="text-gray-200">{info.methodName}</span>
                                </div>
                                {info.accountTitle ? (
                                  <div className="text-gray-400">
                                    Account Title: <span className="text-gray-200">{info.accountTitle}</span>
                                  </div>
                                ) : null}
                                {info.accountNumber ? (
                                  <div className="text-gray-400">
                                    Account No: <span className="text-gray-200">{info.accountNumber}</span>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })()}
                          {!canSelect ? (
                            <p className="text-xs text-red-400">
                              Remaining ({formatAmount(rd.remaining_amount)}) &lt; recharge amount ({formatAmount(rechargeAmount)})
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border ${
                            selected ? "border-sky-500 bg-sky-500" : canSelect ? "border-gray-500" : "border-gray-700"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {touched && tab === "ct" && !selectedCTId && !ctWarning ? (
          <p className="text-xs text-red-300">Please select a bank account.</p>
        ) : null}
        {touched && tab === "pt" && !selectedPTId && eligibleRedeems.length > 0 ? (
          <p className="text-xs text-red-300">Please select a redeem request.</p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={!!loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={tab === "ct" ? !canApproveCT || !!ctWarning : !canApprovePT}
            loading={loading}
          >
            {tab === "ct" ? "Approve (CT)" : "Approve (PT)"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
