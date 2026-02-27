"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const enabledRef = useRef(enabled);
  const restrictedEntityIdRef = useRef(restrictedEntityId);
  enabledRef.current = enabled;
  restrictedEntityIdRef.current = restrictedEntityId;

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (restrictedEntityId) {
          const e = await entityService.fetchEntityById(restrictedEntityId);
          if (!cancelled) setData(e ? [e] : []);
        } else {
          const list = await entityService.fetchEntities();
          if (!cancelled) setData(list);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [enabled, restrictedEntityId]);

  const refetch = useCallback(async () => {
    if (!enabledRef.current) return;
    setError(null);
    try {
      if (restrictedEntityIdRef.current) {
        const e = await entityService.fetchEntityById(restrictedEntityIdRef.current);
        setData(e ? [e] : []);
      } else {
        const list = await entityService.fetchEntities();
        setData(list);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  const byId = useMemo(() => {
    const m = new Map<string, entityService.EntityOption>();
    data.forEach((e) => m.set(e.id, e));
    return m;
  }, [data]);

  return { data, byId, loading, error, refetch };
}
