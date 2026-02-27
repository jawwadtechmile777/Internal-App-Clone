"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as operationsService from "@/services/operationsService";
import type { RechargeRequestRow } from "@/types/recharge";

type ListData = RechargeRequestRow[] | { rows: RechargeRequestRow[]; total: number };
type PrevQueries = Array<[readonly unknown[], ListData | undefined]>;

function patchInList(
  data: ListData | undefined,
  id: string,
  patch: Partial<RechargeRequestRow>
): ListData | undefined {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((r) => (r.id === id ? { ...r, ...patch } : r));
  }
  return {
    ...data,
    rows: data.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  };
}

export function useOperationsCompleteRechargeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string }) => {
      await operationsService.operationsComplete(vars.requestId);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["operationsRechargeRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["operationsRechargeRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchInList(data, vars.requestId, {
            operations_status: "completed",
            entity_status: "completed",
            finance_status: "completed",
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
      qc.invalidateQueries({ queryKey: ["operationsRechargeRequests"] });
      qc.invalidateQueries({ queryKey: ["financeRechargeRequests"] });
    },
  });
}

export function useOperationsRejectRechargeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string; reason: string }) => {
      await operationsService.operationsReject(vars.requestId, vars.reason);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["operationsRechargeRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["operationsRechargeRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchInList(data, vars.requestId, {
            operations_status: "rejected",
            entity_status: "rejected",
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
      qc.invalidateQueries({ queryKey: ["operationsRechargeRequests"] });
      qc.invalidateQueries({ queryKey: ["financeRechargeRequests"] });
    },
  });
}
