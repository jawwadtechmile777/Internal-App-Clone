"use client";

import { useState, useEffect, useCallback } from "react";
import * as rechargeService from "@/services/rechargeService";
import type { RechargeRequestRow } from "@/types/recharge";

export interface UseRechargeRequestsFilters {
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

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await rechargeService.fetchRechargeRequests(filters);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [
    filters?.entity_status,
    filters?.finance_status,
    filters?.verification_status,
    filters?.operations_status,
    filters?.tag_type,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useRechargeRequestById(id: string | null) {
  const [data, setData] = useState<RechargeRequestRow | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await rechargeService.fetchRechargeRequestById(id);
      setData(row);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
