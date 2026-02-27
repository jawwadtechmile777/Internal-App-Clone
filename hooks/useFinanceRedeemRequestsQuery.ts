"use client";

import { useQuery } from "@tanstack/react-query";
import * as redeemService from "@/services/redeemService";
import type { RedeemFilters } from "@/types/redeem";

export type FinanceRedeemFilter = "actionable" | "completed" | "all";

export function useFinanceRedeemRequestsQuery(params: {
  page: number;
  pageSize: number;
  filter?: FinanceRedeemFilter;
}) {
  const f = params.filter ?? "all";

  const filters: RedeemFilters =
    f === "actionable"
      ? { verification_status: "verified", remaining_gt_zero: true }
      : f === "completed"
        ? { finance_status: "completed" }
        : { verification_status: "verified" };

  return useQuery({
    queryKey: ["financeRedeemRequests", { page: params.page, pageSize: params.pageSize, filter: f }],
    queryFn: () =>
      redeemService.fetchRedeemRequestsPaged({
        page: params.page,
        pageSize: params.pageSize,
        filters,
      }),
    staleTime: 5_000,
    gcTime: 60_000,
  });
}

