"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as supportService from "@/services/supportService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useSupportRequests(filters?: { entity_id?: string | null; entity_status?: "pending" | "payment_submitted" }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const entityId = filters?.entity_id;
  const entityStatus = filters?.entity_status;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await supportService.fetchSupportRechargeRequests(filtersRef.current);
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [entityId, entityStatus]);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const list = await supportService.fetchSupportRechargeRequests(filtersRef.current);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
