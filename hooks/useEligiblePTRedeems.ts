"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEligiblePTRedeems } from "@/services/redeemService";

export function useEligiblePTRedeems(entityId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["eligiblePTRedeems", entityId],
    enabled: enabled && !!entityId,
    queryFn: () => fetchEligiblePTRedeems(entityId!),
    staleTime: 10_000,
    gcTime: 60_000,
  });
}
