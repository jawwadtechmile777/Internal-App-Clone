"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as operationsService from "@/services/operationsService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useOperationsRequests(filters?: { operations_status?: string }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const operationsStatus = filters?.operations_status;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await operationsService.fetchOperationsRechargeRequests({
          operations_status: operationsStatus as "processing" | "completed" | "all" | undefined,
        });
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [operationsStatus]);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const list = await operationsService.fetchOperationsRechargeRequests({
        operations_status: filtersRef.current?.operations_status as "processing" | "completed" | "all" | undefined,
      });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
