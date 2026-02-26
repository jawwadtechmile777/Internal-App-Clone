"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as financeService from "@/services/financeService";
import type { RechargeFinanceStatus, RechargeRequestRow } from "@/types/recharge";

export interface UseFinanceRechargeRequestsParams {
  finance_status?: RechargeFinanceStatus;
  initialPage?: number;
  pageSize?: number;
}

type BusyAction = "approve" | "reject" | null;

export function useFinanceRechargeRequests(params?: UseFinanceRechargeRequestsParams) {
  const finance_status = params?.finance_status;
  const [page, setPage] = useState(params?.initialPage ?? 1);
  const [pageSize, setPageSize] = useState(params?.pageSize ?? 20);

  const [rows, setRows] = useState<RechargeRequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeService.fetchFinanceRechargeRequestsPaged({
        page,
        pageSize,
        finance_status: finance_status ?? undefined,
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [finance_status, page, pageSize]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    setPage(1);
  }, [finance_status, pageSize]);

  const approve = useCallback(
    async (requestId: string) => {
      setBusyId(requestId);
      setBusyAction("approve");
      setError(null);

      const prev = rows;
      setRows((cur) =>
        cur.map((r) =>
          r.id === requestId
            ? { ...r, finance_status: "approved", operations_status: "pending", updated_at: new Date().toISOString() }
            : r
        )
      );

      try {
        await financeService.financeApprove(requestId);
        if (finance_status === "pending") {
          setRows((cur) => cur.filter((r) => r.id !== requestId));
          setTotal((t) => Math.max(0, t - 1));
        }
      } catch (e) {
        setRows(prev);
        setError(e instanceof Error ? e : new Error(String(e)));
        throw e;
      } finally {
        setBusyId(null);
        setBusyAction(null);
      }
    },
    [finance_status, rows]
  );

  const reject = useCallback(
    async (requestId: string, reason: string) => {
      setBusyId(requestId);
      setBusyAction("reject");
      setError(null);

      const prev = rows;
      setRows((cur) =>
        cur.map((r) =>
          r.id === requestId
            ? {
                ...r,
                finance_status: "rejected",
                entity_status: "rejected",
                operations_status: "cancelled",
                remarks: reason,
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );

      try {
        await financeService.financeRejectInitial(requestId, reason);
        if (finance_status === "pending") {
          setRows((cur) => cur.filter((r) => r.id !== requestId));
          setTotal((t) => Math.max(0, t - 1));
        }
      } catch (e) {
        setRows(prev);
        setError(e instanceof Error ? e : new Error(String(e)));
        throw e;
      } finally {
        setBusyId(null);
        setBusyAction(null);
      }
    },
    [finance_status, rows]
  );

  return {
    rows,
    total,
    loading,
    error,
    page,
    pageSize,
    pageCount,
    busyId,
    busyAction,
    setPage,
    setPageSize,
    refetch,
    approve,
    reject,
  };
}

