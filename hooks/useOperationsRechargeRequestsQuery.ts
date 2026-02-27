"use client";

import { useQuery } from "@tanstack/react-query";
import * as operationsService from "@/services/operationsService";
import type { RechargeOperationsStatus } from "@/types/recharge";

export function useOperationsRechargeRequestsQuery(params: {
  page: number;
  pageSize: number;
  operations_status?: RechargeOperationsStatus | "all";
}) {
  const status = params.operations_status ?? "all";

  return useQuery({
    queryKey: [
      "operationsRechargeRequests",
      { page: params.page, pageSize: params.pageSize, operations_status: status },
    ],
    queryFn: () =>
      operationsService.fetchOperationsRechargeRequestsPaged({
        page: params.page,
        pageSize: params.pageSize,
        operations_status: status,
      }),
    staleTime: 10_000,
    gcTime: 60_000,
  });
}
