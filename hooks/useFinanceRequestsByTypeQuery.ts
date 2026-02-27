"use client";

import { useQuery } from "@tanstack/react-query";
import * as requestsService from "@/services/requestsService";

export function useFinanceRequestsByTypeQuery(
  params: { page: number; pageSize: number; type: string } | null
) {
  return useQuery({
    queryKey: ["financeRequestsByType", params ? { page: params.page, pageSize: params.pageSize, type: params.type } : null],
    enabled: !!params,
    queryFn: () => {
      if (!params) return Promise.resolve({ rows: [], total: 0 });
      return requestsService.fetchRequestsByTypePaged({
        page: params.page,
        pageSize: params.pageSize,
        type: params.type,
      });
    },
    staleTime: 5_000,
    gcTime: 60_000,
  });
}

