"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as redeemService from "@/services/redeemService";
import type { RedeemRequestRow } from "@/types/redeem";

type ListData = { rows: RedeemRequestRow[]; total: number };
type PrevQueries = Array<[readonly unknown[], ListData | undefined]>;

function patchInList(
  data: ListData | undefined,
  id: string,
  patch: Partial<RedeemRequestRow>
): ListData | undefined {
  if (!data) return data;
  return {
    ...data,
    rows: data.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  };
}

export function useOperationsProcessRedeem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { redeemId: string }) => {
      await redeemService.processRedeemOperation(vars.redeemId);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["operationsRedeemRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["operationsRedeemRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchInList(data, vars.redeemId, {
            operations_status: "processed",
            status: "processing",
            updated_at: now,
          })
        );
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operationsRedeemRequests"] });
      qc.invalidateQueries({ queryKey: ["verificationRedeemRequests"] });
    },
  });
}

export function useVerificationVerifyRedeem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { redeemId: string }) => {
      await redeemService.verifyRedeemRequest(vars.redeemId);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["verificationRedeemRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["verificationRedeemRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchInList(data, vars.redeemId, {
            verification_status: "verified",
            status: "verified",
            updated_at: now,
          })
        );
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verificationRedeemRequests"] });
      qc.invalidateQueries({ queryKey: ["financeRedeemRequests"] });
    },
  });
}

export function useFinancePayRedeem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { redeemId: string; paymentAmount: number }) => {
      await redeemService.processRedeemPayment(vars.redeemId, vars.paymentAmount);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["financeRedeemRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["financeRedeemRequests"],
      });

      const allRows = prev.flatMap(([, d]) => d?.rows ?? []);
      const row = allRows.find((r) => r.id === vars.redeemId);
      if (!row) return { prev };

      const newPaid = row.paid_amount + vars.paymentAmount;
      const newRemaining = row.total_amount - newPaid;
      const isFullyPaid = newRemaining === 0;
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchInList(data, vars.redeemId, {
            paid_amount: newPaid,
            remaining_amount: newRemaining,
            finance_status: isFullyPaid ? "completed" : "partial",
            status: isFullyPaid ? "completed" : "partially_completed",
            updated_at: now,
          })
        );
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeRedeemRequests"] });
    },
  });
}
