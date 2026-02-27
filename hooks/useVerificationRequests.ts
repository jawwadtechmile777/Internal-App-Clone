"use client";

import { useQuery } from "@tanstack/react-query";
import * as verificationService from "@/services/verificationService";
import type { RechargeVerificationStatus } from "@/types/recharge";

export function useVerificationRechargeRequestsQuery(params: {
  page: number;
  pageSize: number;
  verification_status?: RechargeVerificationStatus | "all";
}) {
  const status = params.verification_status ?? "pending";

  return useQuery({
    queryKey: [
      "verificationRechargeRequests",
      { page: params.page, pageSize: params.pageSize, verification_status: status },
    ],
    queryFn: () =>
      verificationService.fetchVerificationRechargeRequestsPaged({
        page: params.page,
        pageSize: params.pageSize,
        verification_status: status,
      }),
    staleTime: 10_000,
    gcTime: 60_000,
  });
}
