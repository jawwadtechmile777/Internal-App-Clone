"use client";

import { useState } from "react";
import { RechargeRequestsTable } from "@/components/tables/RechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { VerificationActionModal } from "@/components/modals/VerificationActionModal";
import { useVerificationRequests } from "@/hooks/useVerificationRequests";
import * as verificationService from "@/services/verificationService";
import type { RechargeRequestRow } from "@/types/recharge";

export default function VerificationDashboardPage() {
  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [actionRow, setActionRow] = useState<RechargeRequestRow | null>(null);

  const { data, loading, error, refetch } = useVerificationRequests({ verification_status: "pending" });

  const handleApprove = async (id: string) => {
    await verificationService.verificationApprove(id);
    refetch();
  };
  const handleReject = async (id: string, remarks?: string) => {
    await verificationService.verificationReject(id, remarks);
    refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Verification</h1>
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}
      <RechargeRequestsTable
        rows={data}
        loading={loading}
        onRowClick={setDetailRow}
        emptyMessage="No PT requests pending verification."
      />
      <div className="flex flex-wrap gap-2">
        {data.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActionRow(r)}
            className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600"
          >
            Action
          </button>
        ))}
      </div>
      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />
      <VerificationActionModal
        open={!!actionRow}
        onClose={() => setActionRow(null)}
        row={actionRow}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
