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
  const hasFetched = useRef(false);

  const refetch = useCallback(async () => {
    if (hasFetched.current) {
      setLoading(false);
    }
    setError(null);
    try {
      const list = await rechargeService.fetchRechargeRequests(filters);
      setData(list);
      hasFetched.current = true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [
    filters?.entity_id,
    filters?.entity_status,
    filters?.finance_status,
    filters?.verification_status,
    filters?.operations_status,
    filters?.tag_type,
  ]);

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

export function useRechargeRequestById(id: string | null) {
  const [data, setData] = useState<RechargeRequestRow | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const refetch = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    if (!hasFetched.current) setLoading(true);
    setError(null);
    try {
      const row = await rechargeService.fetchRechargeRequestById(id);
      setData(row);
      hasFetched.current = true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [id]);

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
