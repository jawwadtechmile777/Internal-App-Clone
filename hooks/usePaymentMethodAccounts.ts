"use client";

import { useQuery } from "@tanstack/react-query";
import * as paymentMethodAccountsService from "@/services/paymentMethodAccountsService";

export function usePaymentMethodAccounts(paymentMethodId: string | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["paymentMethodAccounts", { paymentMethodId }],
    enabled: enabled && !!paymentMethodId,
    queryFn: async () => {
      if (!paymentMethodId) return [];
      return paymentMethodAccountsService.fetchActivePaymentMethodAccountsByPaymentMethodId(paymentMethodId);
    },
    staleTime: 30_000,
  });
}

