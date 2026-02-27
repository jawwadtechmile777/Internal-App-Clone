"use client";

import { useQuery } from "@tanstack/react-query";
import * as paymentMethodAccountsService from "@/services/paymentMethodAccountsService";

export function usePaymentMethodAccounts(
  params: { paymentMethodId?: string | null; paymentMethodName?: string | null } | null | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["paymentMethodAccounts", { paymentMethodId: params?.paymentMethodId ?? null, paymentMethodName: params?.paymentMethodName ?? null }],
    enabled: enabled && (!!params?.paymentMethodId || !!params?.paymentMethodName),
    queryFn: async () => {
      return paymentMethodAccountsService.fetchActivePaymentMethodAccountsForRechargePaymentMethod({
        paymentMethodId: params?.paymentMethodId ?? null,
        paymentMethodName: params?.paymentMethodName ?? null,
      });
    },
    staleTime: 30_000,
  });
}

