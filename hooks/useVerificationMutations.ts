"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as verificationService from "@/services/verificationService";
import type { RechargeRequestRow } from "@/types/recharge";

type ListData = { rows: RechargeRequestRow[]; total: number };
type PrevQueries = Array<[readonly unknown[], ListData | undefined]>;

function patchRow(
  data: ListData | undefined,
  id: string,
  patch: Partial<RechargeRequestRow>
): ListData | undefined {
  if (!data) return data;
  return {
    ...data,
    rows: data.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  };
}

export function useVerificationApproveRechargeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string }) => {
      await verificationService.verificationApprove(vars.requestId);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["verificationRechargeRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["verificationRechargeRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchRow(data, vars.requestId, {
            verification_status: "approved",
            operations_status: "waiting_operations",
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
      qc.invalidateQueries({ queryKey: ["verificationRechargeRequests"] });
      qc.invalidateQueries({ queryKey: ["operationsRechargeRequests"] });
    },
  });
}

export function useVerificationRejectRechargeRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { requestId: string; reason: string }) => {
      await verificationService.verificationReject(vars.requestId, vars.reason);
      return vars;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["verificationRechargeRequests"] });
      const prev: PrevQueries = qc.getQueriesData<ListData>({
        queryKey: ["verificationRechargeRequests"],
      });
      const now = new Date().toISOString();

      prev.forEach(([key, data]) => {
        qc.setQueryData(
          key,
          patchRow(data, vars.requestId, {
            verification_status: "rejected",
            entity_status: "rejected",
            finance_status: "rejected",
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
      qc.invalidateQueries({ queryKey: ["verificationRechargeRequests"] });
    },
  });
}
