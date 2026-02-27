"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLinkedRedeem } from "@/services/verificationService";

export function useLinkedRedeemQuery(redeemId: string | null | undefined) {
  return useQuery({
    queryKey: ["linkedRedeem", redeemId],
    queryFn: () => fetchLinkedRedeem(redeemId!),
    enabled: !!redeemId,
    staleTime: 30_000,
    gcTime: 120_000,
  });
}
