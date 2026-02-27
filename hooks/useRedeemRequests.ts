"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { RedeemRequestRow } from "@/types/redeem";
import * as redeemService from "@/services/redeemService";

export function useRedeemRequests(filters: { entity_id: string } | null) {
  const [data, setData] = useState<RedeemRequestRow[]>([]);
  const [loading, setLoading] = useState(!!filters?.entity_id);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const refetch = useCallback(async () => {
    if (!filters?.entity_id) {
      setData([]);
      setLoading(false);
      return;
    }
    if (!hasFetched.current) setLoading(true);
    setError(null);
    try {
      const list = await redeemService.fetchRedeemRequests({ entity_id: filters.entity_id });
      setData(list);
      hasFetched.current = true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.entity_id]);

  useEffect(() => {
    hasFetched.current = false;
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
