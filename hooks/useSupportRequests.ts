"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as supportService from "@/services/supportService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useSupportRequests(filters?: { entity_id?: string | null; entity_status?: "pending" | "payment_submitted" }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const refetch = useCallback(async () => {
    if (hasFetched.current) {
      setLoading(false);
    }
    setError(null);
    try {
      const list = await supportService.fetchSupportRechargeRequests(filters);
      setData(list);
      hasFetched.current = true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.entity_id, filters?.entity_status]);

  useEffect(() => {
    setLoading(true);
    refetch();
  }, [refetch]);

  useEffect(() => {
    const onFocus = () => {
      refetch();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  return { data, loading, error, refetch };
}
