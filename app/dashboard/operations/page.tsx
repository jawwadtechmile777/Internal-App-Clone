"use client";

import { useState } from "react";
import { RechargeRequestsTable } from "@/components/tables/RechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { OperationsCompleteModal } from "@/components/modals/OperationsCompleteModal";
import { useOperationsRequests } from "@/hooks/useOperationsRequests";
import * as operationsService from "@/services/operationsService";
import type { RechargeRequestRow } from "@/types/recharge";

export default function OperationsDashboardPage() {
  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [completeRow, setCompleteRow] = useState<RechargeRequestRow | null>(null);
  const [filter, setFilter] = useState<"waiting_operations" | "completed" | undefined>("waiting_operations");

  const { data, loading, error, refetch } = useOperationsRequests({
    operations_status: filter,
  });

  const handleComplete = async (id: string) => {
    await operationsService.operationsComplete(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Operations</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("waiting_operations")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === "waiting_operations" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Waiting
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === "completed" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Completed
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}
      <RechargeRequestsTable
        rows={data}
        loading={loading}
        onRowClick={setDetailRow}
        emptyMessage="No requests waiting operations."
      />
      <div className="flex flex-wrap gap-2">
        {data
          .filter((r) => r.operations_status === "waiting_operations")
          .map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setCompleteRow(r)}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600"
            >
              Mark complete
            </button>
          ))}
      </div>
      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />
      <OperationsCompleteModal
        open={!!completeRow}
        onClose={() => setCompleteRow(null)}
        row={completeRow}
        onComplete={handleComplete}
      />
    </div>
  );
}
