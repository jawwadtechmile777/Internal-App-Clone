"use client";

import { useState } from "react";
import { RechargeRequestsTable } from "@/components/tables/RechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { SupportSubmitPaymentModal } from "@/components/modals/SupportSubmitPaymentModal";
import { CreateRechargeModal } from "@/components/modals/CreateRechargeModal";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useAuth } from "@/hooks/useAuth";
import * as supportService from "@/services/supportService";
import type { RechargeRequestRow } from "@/types/recharge";

export default function SupportDashboardPage() {
  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [submitPaymentRow, setSubmitPaymentRow] = useState<RechargeRequestRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();

  const { data, loading, error, refetch } = useSupportRequests();

  const handleSubmitPayment = async (
    requestId: string,
    proofPath: string,
    accountId?: string | null
  ) => {
    await supportService.supportSubmitPaymentProof(requestId, proofPath, accountId);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-100">Support</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Create request
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-900/40 border border-red-800 px-4 py-3 text-sm text-red-300">
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
          .filter(
            (r) =>
              r.finance_status === "approved" && r.entity_status !== "payment_submitted"
          )
          .map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSubmitPaymentRow(r)}
              className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Submit payment
            </button>
          ))}
      </div>
      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />
      <SupportSubmitPaymentModal
        open={!!submitPaymentRow}
        onClose={() => setSubmitPaymentRow(null)}
        row={submitPaymentRow}
        onSubmit={handleSubmitPayment}
      />
      {user && (
        <CreateRechargeModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          requestedByUserId={user.id}
          onCreated={refetch}
        />
      )}
    </div>
  );
}
