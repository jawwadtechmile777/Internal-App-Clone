"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as entityService from "@/services/entityService";

export interface UseEntitiesOptions {
  enabled?: boolean;
  /** When set, fetch only this entity (Support Admin restriction). */
  restrictedEntityId?: string | null;
}

export function useEntities(options?: UseEntitiesOptions) {
  const enabled = options?.enabled ?? true;
  const restrictedEntityId = options?.restrictedEntityId ?? null;

  const [data, setData] = useState<entityService.EntityOption[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (restrictedEntityId) {
        const e = await entityService.fetchEntityById(restrictedEntityId);
        setData(e ? [e] : []);
      } else {
        const list = await entityService.fetchEntities();
        setData(list);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [enabled, restrictedEntityId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const byId = useMemo(() => {
    const m = new Map<string, entityService.EntityOption>();
    data.forEach((e) => m.set(e.id, e));
    return m;
  }, [data]);

  return { data, byId, loading, error, refetch };
}

