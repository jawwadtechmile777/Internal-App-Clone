"use client";

import { useState } from "react";
import { RechargeRequestsTable } from "@/components/tables/RechargeRequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { UploadPaymentProofModal } from "@/components/modals/UploadPaymentProofModal";
import { CreateRechargeModal } from "@/components/modals/CreateRechargeModal";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentSlug } from "@/lib/roleGuard";
import { isSupportSlug } from "@/lib/roleConfig";
import type { RechargeRequestRow } from "@/types/recharge";

export default function SupportDashboardPage() {
  const [detailRow, setDetailRow] = useState<RechargeRequestRow | null>(null);
  const [submitPaymentRow, setSubmitPaymentRow] = useState<RechargeRequestRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();
  const slug = getDepartmentSlug(user ?? null);
  const entityId = slug && isSupportSlug(slug) ? user?.entity_id ?? undefined : undefined;

  const { data, loading, error, refetch } = useSupportRequests({ entity_id: entityId });

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
        showSubmitPayment={!!entityId}
        onSubmitPayment={(r) => setSubmitPaymentRow(r)}
      />
      <RechargeDetailModal open={!!detailRow} onClose={() => setDetailRow(null)} row={detailRow} />
      <UploadPaymentProofModal
        open={!!submitPaymentRow}
        onClose={() => setSubmitPaymentRow(null)}
        row={submitPaymentRow}
        onSubmitted={async () => refetch()}
      />
      {user && (
        <CreateRechargeModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          requestedByUserId={user.id}
          onCreated={refetch}
          restrictedEntityId={entityId}
        />
      )}
    </div>
  );
}
