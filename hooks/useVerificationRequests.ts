"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as verificationService from "@/services/verificationService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useVerificationRequests(filters?: { verification_status?: string }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const verificationStatus = filters?.verification_status;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await verificationService.fetchVerificationRechargeRequests({
          verification_status: verificationStatus as "pending" | "approved" | "rejected" | undefined,
        });
        if (!cancelled) setData(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [verificationStatus]);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const list = await verificationService.fetchVerificationRechargeRequests({
        verification_status: filtersRef.current?.verification_status as "pending" | "approved" | "rejected" | undefined,
      });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return { data, loading, error, refetch };
}
