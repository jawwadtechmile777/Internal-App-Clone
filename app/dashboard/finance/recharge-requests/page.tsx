"use client";

import { useEffect, useMemo, useState } from "react";
import { FinanceRechargeRequestsTable } from "@/components/finance/FinanceRechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { AssignPaymentAccountModal } from "@/components/modals/AssignPaymentAccountModal";
import { FinanceRejectReasonModal } from "@/components/modals/FinanceRejectReasonModal";
import { useFinanceRechargeRequestsQuery } from "@/hooks/useFinanceRechargeRequestsQuery";
import { useFinanceApproveRechargeRequest, useFinanceRejectRechargeRequest } from "@/hooks/useFinanceRechargeMutations";
import { useToast } from "@/hooks/useToast";
import type { RechargeFinanceStatus, RechargeRequestRow } from "@/types/recharge";

export default function FinanceRechargeRequestsPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<RechargeFinanceStatus | undefined>("pending");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const listQuery = useFinanceRechargeRequestsQuery({ page, pageSize, finance_status: filter });
  const approveMutation = useFinanceApproveRechargeRequest();
  const rejectMutation = useFinanceRejectRechargeRequest();

  const rows = listQuery.data?.rows ?? [];
  const total = listQuery.data?.total ?? 0;
  const loading = listQuery.isLoading || listQuery.isFetching;
  const error = listQuery.error instanceof Error ? listQuery.error : null;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const busyId = approveMutation.isPending
    ? approveMutation.variables?.requestId ?? null
    : rejectMutation.isPending
      ? rejectMutation.variables?.requestId ?? null
      : null;
  const busyAction = approveMutation.isPending ? "approve" : rejectMutation.isPending ? "reject" : null;

  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [approveRow, setApproveRow] = useState<RechargeRequestRow | null>(null);
  const [rejectRow, setRejectRow] = useState<RechargeRequestRow | null>(null);

  // Reset pagination when filter/page size changes.
  useEffect(() => {
    setPage(1);
  }, [filter, pageSize]);

  const summary = useMemo(() => {
    const shown = rows.length;
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = total === 0 ? 0 : Math.min(total, page * pageSize);
    return { shown, start, end };
  }, [rows.length, total, page, pageSize]);

  const handleReject = async (reason: string) => {
    if (!rejectRow) return;
    try {
      await rejectMutation.mutateAsync({ requestId: rejectRow.id, reason });
      showToast({ variant: "success", title: "Rejected", description: "Recharge request rejected successfully." });
      setRejectRow(null);
    } catch (e) {
      showToast({
        variant: "error",
        title: "Reject failed",
        description: e instanceof Error ? e.message : "Unable to reject request.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Finance • Recharge requests</h1>
          <p className="mt-1 text-sm text-gray-400">Review and approve/reject incoming recharge requests.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(undefined)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${filter === undefined ? "bg-slate-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${filter === "pending" ? "bg-slate-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"}`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilter("approved")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${filter === "approved" ? "bg-slate-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"}`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setFilter("rejected")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${filter === "rejected" ? "bg-slate-600 text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {error.message}
        </div>
      ) : null}

      <FinanceRechargeRequestsTable
        rows={rows}
        loading={loading}
        busyId={busyId}
        busyAction={busyAction}
        onView={(r) => setDetailRow(r)}
        onApprove={(r) => setApproveRow(r)}
        onReject={(r) => setRejectRow(r)}
        emptyMessage={filter ? `No ${filter} requests.` : "No recharge requests."}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-400">
          Showing <span className="text-gray-200">{summary.start}</span>–<span className="text-gray-200">{summary.end}</span>{" "}
          of <span className="text-gray-200">{total}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-400">
            Page size{" "}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ml-2 rounded-lg border border-gray-600 bg-slate-800 px-2 py-1 text-sm text-gray-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-gray-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-300">
              Page <span className="text-gray-100">{page}</span> / <span className="text-gray-100">{pageCount}</span>
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount, page + 1))}
              disabled={page >= pageCount || loading}
              className="rounded-lg border border-gray-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />

      <AssignPaymentAccountModal
        open={!!approveRow}
        row={approveRow}
        loading={approveMutation.isPending}
        onConfirm={async (paymentMethodAccountId) => {
          if (!approveRow) return;
          try {
            await approveMutation.mutateAsync({ requestId: approveRow.id, paymentMethodAccountId });
            showToast({ variant: "success", title: "Approved", description: "Payment account assigned and approved." });
            setApproveRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Approve failed",
              description: e instanceof Error ? e.message : "Unable to approve request.",
            });
          }
        }}
        onClose={() => setApproveRow(null)}
      />

      <FinanceRejectReasonModal
        open={!!rejectRow}
        onClose={() => setRejectRow(null)}
        loading={busyId === rejectRow?.id && busyAction === "reject"}
        onConfirm={handleReject}
      />
    </div>
  );
}

