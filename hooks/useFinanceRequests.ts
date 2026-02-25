"use client";

import { useState, useEffect, useCallback } from "react";
import * as financeService from "@/services/financeService";
import type { RechargeRequestRow } from "@/types/recharge";

export interface UseFinanceRequestsFilters {
  finance_status?: "pending" | "approved" | "rejected";
  tag_type?: "CT" | "PT";
}

export function useFinanceRequests(filters?: UseFinanceRequestsFilters) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await financeService.fetchFinanceRechargeRequests(filters);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.finance_status, filters?.tag_type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
