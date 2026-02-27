"use client";

import { useQuery } from "@tanstack/react-query";
import * as redeemService from "@/services/redeemService";

export function useFinanceRedeemRequestsQuery(params: { page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["financeRedeemRequests", { page: params.page, pageSize: params.pageSize }],
    queryFn: () => redeemService.fetchRedeemRequestsPaged({ page: params.page, pageSize: params.pageSize }),
    staleTime: 5_000,
    gcTime: 60_000,
  });
}

