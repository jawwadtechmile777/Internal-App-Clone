"use client";

import { useState, useEffect, useCallback } from "react";
import * as operationsService from "@/services/operationsService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useOperationsRequests(filters?: { operations_status?: string }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await operationsService.fetchOperationsRechargeRequests({
        operations_status: filters?.operations_status as "waiting_operations" | "completed" | undefined,
      });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.operations_status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
