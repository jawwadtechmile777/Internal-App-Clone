"use client";

import { useState } from "react";
import { OperationsRechargeRequestsTable } from "@/components/operations/OperationsRechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { OperationsCompleteModal } from "@/components/modals/OperationsCompleteModal";
import { FinanceRejectReasonModal } from "@/components/modals/FinanceRejectReasonModal";
import { useOperationsRechargeRequestsQuery } from "@/hooks/useOperationsRechargeRequestsQuery";
import {
  useOperationsCompleteRechargeRequest,
  useOperationsRejectRechargeRequest,
} from "@/hooks/useOperationsMutations";
import { useToast } from "@/hooks/useToast";
import type { RechargeRequestRow, RechargeOperationsStatus } from "@/types/recharge";

type OpsFilter = RechargeOperationsStatus | "all";

export default function OperationsDashboardPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<OpsFilter>("processing");
  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [completeRow, setCompleteRow] = useState<RechargeRequestRow | null>(null);
  const [rejectRow, setRejectRow] = useState<RechargeRequestRow | null>(null);

  const query = useOperationsRechargeRequestsQuery({
    page: 1,
    pageSize: 50,
    operations_status: filter,
  });
  const completeMutation = useOperationsCompleteRechargeRequest();
  const rejectMutation = useOperationsRejectRechargeRequest();

  const busyId =
    completeMutation.isPending
      ? completeMutation.variables?.requestId ?? null
      : rejectMutation.isPending
        ? rejectMutation.variables?.requestId ?? null
        : null;
  const busyAction = completeMutation.isPending
    ? ("complete" as const)
    : rejectMutation.isPending
      ? ("reject" as const)
      : null;

  const filterBtn = (label: string, value: OpsFilter) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
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
          <h1 className="text-2xl font-semibold text-gray-100">Operations</h1>
          <p className="mt-1 text-sm text-gray-400">Recharge requests ready for completion.</p>
        </div>
        <div className="flex gap-2">
          {filterBtn("Processing", "processing")}
          {filterBtn("Completed", "completed")}
        </div>
      </div>

      {query.error ? (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {query.error instanceof Error ? query.error.message : "Failed to load requests."}
        </div>
      ) : null}

      <OperationsRechargeRequestsTable
        rows={query.data?.rows ?? []}
        loading={query.isLoading && !query.data}
        busyId={busyId}
        busyAction={busyAction}
        onView={(r) => setDetailRow(r)}
        onComplete={(r) => setCompleteRow(r)}
        onReject={(r) => setRejectRow(r)}
        emptyMessage={filter === "processing" ? "No requests awaiting completion." : "No completed requests."}
      />

      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />

      <OperationsCompleteModal
        open={!!completeRow}
        onClose={() => setCompleteRow(null)}
        row={completeRow}
        loading={completeMutation.isPending}
        onConfirm={async () => {
          if (!completeRow) return;
          try {
            await completeMutation.mutateAsync({ requestId: completeRow.id });
            showToast({ variant: "success", title: "Completed", description: "Recharge request has been completed." });
            setCompleteRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Complete failed",
              description: e instanceof Error ? e.message : "Unable to complete request.",
            });
          }
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
            showToast({ variant: "success", title: "Rejected", description: "Recharge request rejected." });
            setRejectRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Reject failed",
              description: e instanceof Error ? e.message : "Unable to reject request.",
            });
          }
        }}
      />
    </div>
  );
}
