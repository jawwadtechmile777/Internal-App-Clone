"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as rechargeService from "@/services/rechargeService";
import type { RechargeRequestRow } from "@/types/recharge";

export interface UseRechargeRequestsFilters {
  entity_id?: string | null;
  entity_status?: string;
  finance_status?: string;
  verification_status?: string;
  operations_status?: string;
  tag_type?: string;
}

export function useRechargeRequests(filters?: UseRechargeRequestsFilters) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const entityId = filters?.entity_id;
  const entityStatus = filters?.entity_status;
  const financeStatus = filters?.finance_status;
  const verificationStatus = filters?.verification_status;
  const operationsStatus = filters?.operations_status;
  const tagType = filters?.tag_type;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await rechargeService.fetchRechargeRequests(filtersRef.current);
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [entityId, entityStatus, financeStatus, verificationStatus, operationsStatus, tagType]);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const list = await rechargeService.fetchRechargeRequests(filtersRef.current);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}

export function useRechargeRequestById(id: string | null) {
  const [data, setData] = useState<RechargeRequestRow | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const idRef = useRef(id);
  idRef.current = id;

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const row = await rechargeService.fetchRechargeRequestById(id);
        if (!cancelled) setData(row);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const refetch = useCallback(async () => {
    if (!idRef.current) return;
    setError(null);
    try {
      const row = await rechargeService.fetchRechargeRequestById(idRef.current);
      setData(row);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
