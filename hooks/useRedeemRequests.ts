"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { RedeemRequestRow } from "@/types/redeem";
import * as redeemService from "@/services/redeemService";

export function useRedeemRequests(filters: { entity_id: string } | null) {
  const [data, setData] = useState<RedeemRequestRow[]>([]);
  const [loading, setLoading] = useState(!!filters?.entity_id);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const entityId = filters?.entity_id;

  useEffect(() => {
    if (!entityId) {
      setData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await redeemService.fetchRedeemRequests({ entity_id: entityId });
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [entityId]);

  const refetch = useCallback(async () => {
    const f = filtersRef.current;
    if (!f?.entity_id) return;
    setError(null);
    try {
      const list = await redeemService.fetchRedeemRequests({ entity_id: f.entity_id });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
