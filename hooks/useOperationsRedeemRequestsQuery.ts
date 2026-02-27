"use client";

import { useQuery } from "@tanstack/react-query";
import * as redeemService from "@/services/redeemService";

export function useOperationsRedeemRequestsQuery(params: {
  page: number;
  pageSize: number;
  filter?: "pending" | "all";
}) {
  const f = params.filter ?? "pending";

  return useQuery({
    queryKey: ["operationsRedeemRequests", { page: params.page, pageSize: params.pageSize, filter: f }],
    queryFn: () =>
      redeemService.fetchRedeemRequestsPaged({
        page: params.page,
        pageSize: params.pageSize,
        filters: f === "all" ? {} : { operations_status: "pending" },
      }),
    staleTime: 5_000,
    gcTime: 60_000,
  });
}
