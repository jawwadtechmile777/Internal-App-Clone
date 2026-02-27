"use client";

import { useMemo, useState } from "react";
import { VerificationRechargeRequestsTable } from "@/components/verification/VerificationRechargeRequestsTable";
import { VerificationDetailsModal } from "@/components/modals/VerificationDetailsModal";
import { FinanceRejectReasonModal } from "@/components/modals/FinanceRejectReasonModal";
import { useVerificationRechargeRequestsQuery } from "@/hooks/useVerificationRequests";
import {
  useVerificationApproveRechargeRequest,
  useVerificationRejectRechargeRequest,
} from "@/hooks/useVerificationMutations";
import { useToast } from "@/hooks/useToast";
import type { RechargeRequestRow, RechargeVerificationStatus } from "@/types/recharge";

type VFilter = RechargeVerificationStatus | "all";

export default function VerificationActivitiesPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<VFilter>("pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const query = useVerificationRechargeRequestsQuery({
    page,
    pageSize,
    verification_status: filter,
  });

  const approveMutation = useVerificationApproveRechargeRequest();
  const rejectMutation = useVerificationRejectRechargeRequest();

  const busyId =
    approveMutation.isPending
      ? approveMutation.variables?.requestId ?? null
      : rejectMutation.isPending
        ? rejectMutation.variables?.requestId ?? null
        : null;
  const busyAction = approveMutation.isPending
    ? ("approve" as const)
    : rejectMutation.isPending
      ? ("reject" as const)
      : null;

  const [viewRow, setViewRow] = useState<RechargeRequestRow | null>(null);
  const [approveRow, setApproveRow] = useState<RechargeRequestRow | null>(null);
  const [rejectRow, setRejectRow] = useState<RechargeRequestRow | null>(null);

  const total = query.data?.total ?? 0;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const filterBtn = (label: string, value: VFilter) => (
    <button
      type="button"
      onClick={() => { setFilter(value); setPage(1); }}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        filter === value
          ? "bg-slate-600 text-white"
          : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Verification Activities</h1>
          <p className="mt-1 text-sm text-gray-400">PT recharge requests awaiting payment verification.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">
            Page size{" "}
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="ml-2 rounded-lg border border-gray-600 bg-slate-800 px-2 py-1 text-sm text-gray-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterBtn("Pending", "pending")}
        {filterBtn("Approved", "approved")}
        {filterBtn("Rejected", "rejected")}
        {filterBtn("All", "all")}
      </div>

      {query.error ? (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {query.error instanceof Error ? query.error.message : "Failed to load requests."}
        </div>
      ) : null}

      <VerificationRechargeRequestsTable
        rows={query.data?.rows ?? []}
        loading={query.isLoading && !query.data}
        busyId={busyId}
        busyAction={busyAction}
        onView={(r) => setViewRow(r)}
        onApprove={(r) => setApproveRow(r)}
        onReject={(r) => setRejectRow(r)}
        emptyMessage="No PT requests pending verification."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-400">
          Page <span className="text-gray-100">{page}</span> / <span className="text-gray-100">{pageCount}</span>{" "}
          <span className="text-gray-500">•</span>{" "}
          Total <span className="text-gray-100">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-slate-700 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount}
            className="rounded-lg border border-gray-700 bg-slate-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* View-only modal (from eye icon) */}
      <VerificationDetailsModal
        open={!!viewRow}
        onClose={() => setViewRow(null)}
        row={viewRow}
        loadingApprove={approveMutation.isPending}
        loadingReject={rejectMutation.isPending}
        onApprove={async () => {
          if (!viewRow) return;
          try {
            await approveMutation.mutateAsync({ requestId: viewRow.id });
            showToast({ variant: "success", title: "Verified", description: "Payment verified — sent to Operations." });
            setViewRow(null);
          } catch (e) {
            showToast({ variant: "error", title: "Verify failed", description: e instanceof Error ? e.message : "Unable to verify." });
          }
        }}
        onReject={() => {
          const r = viewRow;
          setViewRow(null);
          setRejectRow(r);
        }}
      />

      {/* Approve modal (from verify/approve icon) */}
      <VerificationDetailsModal
        open={!!approveRow}
        onClose={() => setApproveRow(null)}
        row={approveRow}
        loadingApprove={approveMutation.isPending}
        loadingReject={rejectMutation.isPending}
        onApprove={async () => {
          if (!approveRow) return;
          try {
            await approveMutation.mutateAsync({ requestId: approveRow.id });
            showToast({ variant: "success", title: "Verified", description: "Payment verified — sent to Operations." });
            setApproveRow(null);
          } catch (e) {
            showToast({ variant: "error", title: "Verify failed", description: e instanceof Error ? e.message : "Unable to verify." });
          }
        }}
        onReject={() => {
          const r = approveRow;
          setApproveRow(null);
          setRejectRow(r);
        }}
      />

      <FinanceRejectReasonModal
        open={!!rejectRow}
        onClose={() => setRejectRow(null)}
        loading={rejectMutation.isPending}
        onConfirm={async (reason) => {
          if (!rejectRow) return;
          try {
            await rejectMutation.mutateAsync({ requestId: rejectRow.id, reason });
            showToast({ variant: "success", title: "Rejected", description: "Verification rejected." });
            setRejectRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Reject failed",
              description: e instanceof Error ? e.message : "Unable to reject.",
            });
          }
        }}
      />
    </div>
  );
}
