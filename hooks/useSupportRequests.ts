"use client";

import { useState, useEffect, useCallback } from "react";
import * as supportService from "@/services/supportService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useSupportRequests(filters?: { entity_id?: string | null; entity_status?: "pending" | "payment_submitted" }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await supportService.fetchSupportRechargeRequests(filters);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.entity_id, filters?.entity_status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
