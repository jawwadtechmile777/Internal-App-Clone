"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as financeService from "@/services/financeService";
import type { RechargeRequestRow } from "@/types/recharge";

type ListData = { rows: RechargeRequestRow[]; total: number };
type PrevQueries = Array<[readonly unknown[], ListData | undefined]>;

function patchRow(
  data: ListData | undefined,
  id: string,
  patch: Partial<RechargeRequestRow>
) {
  if (!data) return data;
  return {
    ...data,
    rows: data.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  };
}

export function useFinanceApproveRechargeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string; paymentMethodAccountId: string }) => {
      await financeService.financeApproveAssignPaymentAccount({
        requestId: vars.requestId,
        paymentMethodAccountId: vars.paymentMethodAccountId,
      });
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["financeRechargeRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["financeRechargeRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchRow(data, vars.requestId, {
            finance_status: "approved",
            entity_status: "payment pending",
            operations_status: "pending",
            payment_method_account_id: vars.paymentMethodAccountId,
            finance_approved_at: now,
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
      qc.invalidateQueries({ queryKey: ["financeRechargeRequests"] });
    },
  });
}

export function useFinanceRejectRechargeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string; reason: string }) => {
      await financeService.financeRejectInitial(vars.requestId, vars.reason);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["financeRechargeRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["financeRechargeRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchRow(data, vars.requestId, {
            finance_status: "rejected",
            entity_status: "rejected",
            operations_status: "cancelled",
            remarks: vars.reason,
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
      qc.invalidateQueries({ queryKey: ["financeRechargeRequests"] });
    },
  });
}

