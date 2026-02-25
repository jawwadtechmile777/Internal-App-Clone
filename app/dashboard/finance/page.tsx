"use client";

import { useState } from "react";
import { RechargeRequestsTable } from "@/components/tables/RechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { FinanceApproveModal } from "@/components/modals/FinanceApproveModal";
import { FinanceVerifyModal } from "@/components/modals/FinanceVerifyModal";
import { useFinanceRequests } from "@/hooks/useFinanceRequests";
import * as financeService from "@/services/financeService";
import type { RechargeRequestRow } from "@/types/recharge";

export default function FinanceDashboardPage() {
  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [approveModalRow, setApproveModalRow] = useState<RechargeRequestRow | null>(null);
  const [verifyModalRow, setVerifyModalRow] = useState<RechargeRequestRow | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | undefined>(undefined);

  const { data, loading, error, refetch } = useFinanceRequests({
    finance_status: filter,
  });

  const handleApproveCT = async (id: string) => {
    await financeService.financeApproveWithCT(id);
    refetch();
  };
  const handleApprovePT = async (id: string) => {
    await financeService.financeApproveWithPT(id);
    refetch();
  };
  const handleReject = async (id: string, remarks?: string) => {
    await financeService.financeReject(id, remarks);
    refetch();
  };
  const handleVerifyAndSendToOperations = async (id: string) => {
    await financeService.financeVerifyAndSendToOperations(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Finance</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter(undefined)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === undefined ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === "pending" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilter("approved")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === "approved" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Approved
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
        emptyMessage="No recharge requests."
      />
      <div className="flex flex-wrap gap-2">
        {data
          .filter((r) => r.finance_status === "pending")
          .map((r) => (
            <button
              key={`approve-${r.id}`}
              type="button"
              onClick={(e) => { e.stopPropagation(); setApproveModalRow(r); }}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600"
            >
              Approve ({r.id.slice(0, 8)})
            </button>
          ))}
        {data
          .filter(
            (r) =>
              r.tag_type === "CT" &&
              r.finance_status === "approved" &&
              r.entity_status === "payment_submitted"
          )
          .map((r) => (
            <button
              key={`verify-${r.id}`}
              type="button"
              onClick={() => setVerifyModalRow(r)}
              className="rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600"
            >
              Verify &rarr; Ops ({r.id.slice(0, 8)})
            </button>
          ))}
      </div>
      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />
      <FinanceApproveModal
        open={!!approveModalRow}
        onClose={() => setApproveModalRow(null)}
        row={approveModalRow}
        onApproveCT={handleApproveCT}
        onApprovePT={handleApprovePT}
        onReject={handleReject}
      />
      <FinanceVerifyModal
        open={!!verifyModalRow}
        onClose={() => setVerifyModalRow(null)}
        row={verifyModalRow}
        onVerifyAndSendToOperations={handleVerifyAndSendToOperations}
      />
    </div>
  );
}
