"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { AppRequestRow } from "@/types/request";
import * as requestsService from "@/services/requestsService";

export function useRequests(filters: { entity_id: string; type: string } | null) {
  const [data, setData] = useState<AppRequestRow[]>([]);
  const [loading, setLoading] = useState(!!filters?.entity_id && !!filters?.type);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const refetch = useCallback(async () => {
    if (!filters?.entity_id || !filters.type) {
      setData([]);
      setLoading(false);
      return;
    }
    if (!hasFetched.current) setLoading(true);
    setError(null);
    try {
      const list = await requestsService.fetchRequestsByEntityAndType(filters);
      setData(list);
      hasFetched.current = true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.entity_id, filters?.type]);

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
