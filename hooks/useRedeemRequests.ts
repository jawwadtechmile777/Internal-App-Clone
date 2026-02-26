"use client";

import { useCallback, useEffect, useState } from "react";
import type { RedeemRequestRow } from "@/types/redeem";
import * as redeemService from "@/services/redeemService";

export function useRedeemRequests(filters: { entity_id: string } | null) {
  const [data, setData] = useState<RedeemRequestRow[]>([]);
  const [loading, setLoading] = useState(!!filters?.entity_id);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!filters?.entity_id) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await redeemService.fetchRedeemRequests({ entity_id: filters.entity_id });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.entity_id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

