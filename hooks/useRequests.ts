"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { AppRequestRow } from "@/types/request";
import * as requestsService from "@/services/requestsService";

export function useRequests(filters: { entity_id: string; type: string } | null) {
  const [data, setData] = useState<AppRequestRow[]>([]);
  const [loading, setLoading] = useState(!!filters?.entity_id && !!filters?.type);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const entityId = filters?.entity_id;
  const type = filters?.type;

  useEffect(() => {
    if (!entityId || !type) {
      setData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await requestsService.fetchRequestsByEntityAndType({ entity_id: entityId, type });
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [entityId, type]);

  const refetch = useCallback(async () => {
    const f = filtersRef.current;
    if (!f?.entity_id || !f.type) return;
    setError(null);
    try {
      const list = await requestsService.fetchRequestsByEntityAndType(f);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
