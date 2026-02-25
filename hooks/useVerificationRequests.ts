"use client";

import { useState, useEffect, useCallback } from "react";
import * as verificationService from "@/services/verificationService";
import type { RechargeRequestRow } from "@/types/recharge";

export function useVerificationRequests(filters?: { verification_status?: string }) {
  const [data, setData] = useState<RechargeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await verificationService.fetchVerificationRechargeRequests({
        verification_status: filters?.verification_status as "pending" | "approved" | "rejected" | undefined,
      });
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [filters?.verification_status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
