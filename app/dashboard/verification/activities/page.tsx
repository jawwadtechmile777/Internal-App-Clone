"use client";

import { useEffect, useMemo, useState } from "react";
import { VerificationRechargeRequestsTable } from "@/components/verification/VerificationRechargeRequestsTable";
import { VerificationRedeemRequestsTable } from "@/components/verification/VerificationRedeemRequestsTable";
import { VerificationDetailsModal } from "@/components/modals/VerificationDetailsModal";
import { VerificationVerifyRedeemModal } from "@/components/modals/VerificationVerifyRedeemModal";
import { FinanceRejectReasonModal } from "@/components/modals/FinanceRejectReasonModal";
import { RedeemDetailModal } from "@/components/modals/RedeemDetailModal";
import { useVerificationRechargeRequestsQuery } from "@/hooks/useVerificationRequests";
import {
  useVerificationApproveRechargeRequest,
  useVerificationRejectRechargeRequest,
} from "@/hooks/useVerificationMutations";
import { useVerificationRedeemRequestsQuery } from "@/hooks/useVerificationRedeemRequestsQuery";
import { useVerificationVerifyRedeem } from "@/hooks/useRedeemMutations";
import { useToast } from "@/hooks/useToast";
import type { RechargeRequestRow, RechargeVerificationStatus } from "@/types/recharge";
import type { RedeemRequestRow } from "@/types/redeem";

type TopTab = "recharge" | "redeem";
type VFilter = RechargeVerificationStatus | "all";

export default function VerificationActivitiesPage() {
  const { showToast } = useToast();

  const [topTab, setTopTab] = useState<TopTab>("recharge");
  const [rechargeFilter, setRechargeFilter] = useState<VFilter>("pending");
  const [redeemFilter, setRedeemFilter] = useState<"pending" | "all">("pending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [topTab, pageSize, rechargeFilter, redeemFilter]);

  const rechargeQuery = useVerificationRechargeRequestsQuery({
    page,
    pageSize,
    verification_status: rechargeFilter,
  });

  const redeemQuery = useVerificationRedeemRequestsQuery({
    page,
    pageSize,
    filter: redeemFilter,
  });

  const approveMutation = useVerificationApproveRechargeRequest();
  const rejectMutation = useVerificationRejectRechargeRequest();
  const verifyRedeemMutation = useVerificationVerifyRedeem();

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
  const [redeemDetail, setRedeemDetail] = useState<RedeemRequestRow | null>(null);
  const [verifyRedeemRow, setVerifyRedeemRow] = useState<RedeemRequestRow | null>(null);

  const total =
    topTab === "recharge"
      ? rechargeQuery.data?.total ?? 0
      : redeemQuery.data?.total ?? 0;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const filterBtn = (label: string, value: VFilter) => (
    <button
      type="button"
      onClick={() => { setRechargeFilter(value); setPage(1); }}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        rechargeFilter === value
          ? "bg-slate-600 text-white"
          : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
      }`}
    >
      {label}
    </button>
  );

  const topTabs: { key: TopTab; label: string }[] = [
    { key: "recharge", label: "Recharge Requests" },
    { key: "redeem", label: "Redeem Requests" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Verification • Activities</h1>
          <p className="mt-1 text-sm text-gray-400">Recharge and redeem requests awaiting verification.</p>
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

      <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-3">
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="flex min-w-max gap-4 pb-1">
            {topTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTopTab(t.key)}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  topTab === t.key
                    ? "text-gray-100 border-slate-400"
                    : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {topTab === "recharge" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {filterBtn("Pending", "pending")}
            {filterBtn("Approved", "approved")}
            {filterBtn("Rejected", "rejected")}
            {filterBtn("All", "all")}
          </div>

          {rechargeQuery.error ? (
            <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {rechargeQuery.error instanceof Error ? rechargeQuery.error.message : "Failed to load requests."}
            </div>
          ) : null}

          <VerificationRechargeRequestsTable
            rows={rechargeQuery.data?.rows ?? []}
            loading={rechargeQuery.isLoading && !rechargeQuery.data}
            busyId={busyId}
            busyAction={busyAction}
            onView={(r) => setViewRow(r)}
            onApprove={(r) => setApproveRow(r)}
            onReject={(r) => setRejectRow(r)}
            emptyMessage="No PT requests pending verification."
          />
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setRedeemFilter("pending"); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                redeemFilter === "pending"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => { setRedeemFilter("all"); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                redeemFilter === "all"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
              }`}
            >
              All
            </button>
          </div>

          {redeemQuery.error ? (
            <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {redeemQuery.error instanceof Error ? redeemQuery.error.message : "Failed to load redeem requests."}
            </div>
          ) : null}

          <VerificationRedeemRequestsTable
            rows={redeemQuery.data?.rows ?? []}
            loading={redeemQuery.isLoading && !redeemQuery.data}
            busyId={verifyRedeemMutation.isPending ? verifyRedeemMutation.variables?.redeemId ?? null : null}
            emptyMessage="No redeem requests pending verification."
            onView={(row) => setRedeemDetail(row)}
            onVerify={(row) => setVerifyRedeemRow(row)}
          />
        </>
      )}

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

      {/* Recharge view-only modal */}
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

      {/* Recharge approve modal */}
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

      {/* Redeem detail modal */}
      <RedeemDetailModal open={!!redeemDetail} onClose={() => setRedeemDetail(null)} row={redeemDetail} />

      {/* Redeem verify modal */}
      <VerificationVerifyRedeemModal
        open={!!verifyRedeemRow}
        onClose={() => setVerifyRedeemRow(null)}
        row={verifyRedeemRow}
        loading={verifyRedeemMutation.isPending}
        onConfirm={async () => {
          if (!verifyRedeemRow) return;
          try {
            await verifyRedeemMutation.mutateAsync({ redeemId: verifyRedeemRow.id });
            showToast({ variant: "success", title: "Verified", description: "Redeem request verified — sent to Finance." });
            setVerifyRedeemRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Verify failed",
              description: e instanceof Error ? e.message : "Unable to verify redeem request.",
            });
          }
        }}
      />
    </div>
  );
}
