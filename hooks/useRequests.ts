"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppRequestRow } from "@/types/request";
import * as requestsService from "@/services/requestsService";

export function useRequests(filters: { entity_id: string; type: string } | null) {
  const [data, setData] = useState<AppRequestRow[]>([]);
  const [loading, setLoading] = useState(!!filters?.entity_id && !!filters?.type);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!filters?.entity_id || !filters.type) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await requestsService.fetchRequestsByEntityAndType(filters);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.entity_id, filters?.type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

