"use client";

import { useQuery } from "@tanstack/react-query";
import * as financeService from "@/services/financeService";
import type { RechargeFinanceStatus } from "@/types/recharge";

export function useFinanceRechargeRequestsQuery(params: {
  page: number;
  pageSize: number;
  finance_status?: RechargeFinanceStatus;
}) {
  const key = [
    "financeRechargeRequests",
    { page: params.page, pageSize: params.pageSize, finance_status: params.finance_status ?? null },
  ] as const;

  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      financeService.fetchFinanceRechargeRequestsPaged({
        page: params.page,
        pageSize: params.pageSize,
        finance_status: params.finance_status ?? undefined,
      }),
    staleTime: 5_000,
    gcTime: 60_000,
  });

  return { key, ...query };
}

