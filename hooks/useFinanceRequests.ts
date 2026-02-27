"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const financeStatus = filters?.finance_status;
  const tagType = filters?.tag_type;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await financeService.fetchFinanceRechargeRequests(filtersRef.current);
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [financeStatus, tagType]);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const list = await financeService.fetchFinanceRechargeRequests(filtersRef.current);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
