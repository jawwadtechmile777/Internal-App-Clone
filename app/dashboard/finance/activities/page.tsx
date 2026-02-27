"use client";

import { useEffect, useMemo, useState } from "react";
import { FinanceRechargeRequestsTable } from "@/components/finance/FinanceRechargeRequestsTable";
import { FinanceRedeemRequestsTable } from "@/components/finance/FinanceRedeemRequestsTable";
import { RequestsTable, type RequestTableRow } from "@/components/entity/RequestsTable";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { AssignPaymentAccountModal } from "@/components/modals/AssignPaymentAccountModal";
import { FinanceRejectReasonModal } from "@/components/modals/FinanceRejectReasonModal";
import { FinanceVerifyPaymentModal } from "@/components/modals/FinanceVerifyPaymentModal";
import { RedeemDetailModal } from "@/components/modals/RedeemDetailModal";
import { RequestDetailModal } from "@/components/modals/RequestDetailModal";
import { useFinanceRechargeRequestsQuery } from "@/hooks/useFinanceRechargeRequestsQuery";
import {
  useFinanceApproveRechargeRequest,
  useFinanceRejectRechargeRequest,
  useFinanceVerifyPaymentRechargeRequest,
  useFinanceRejectVerificationRechargeRequest,
  useFinanceApprovePTRechargeRequest,
} from "@/hooks/useFinanceRechargeMutations";
import { useToast } from "@/hooks/useToast";
import type { RechargeFinanceStatus, RechargeRequestRow } from "@/types/recharge";
import type { RedeemRequestRow } from "@/types/redeem";
import type { AppRequestRow } from "@/types/request";
import { useFinanceRedeemRequestsQuery } from "@/hooks/useFinanceRedeemRequestsQuery";
import { useFinanceRequestsByTypeQuery } from "@/hooks/useFinanceRequestsByTypeQuery";

type ActivityListTab =
  | "recharge"
  | "redeem"
  | "transfer"
  | "reset_password"
  | "new_account_creation"
  | "referral"
  | "free_play";

function formatAmount(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function FinanceActivitiesPage() {
  const { showToast } = useToast();

  const [listTab, setListTab] = useState<ActivityListTab>("recharge");
  const [rechargeFilter, setRechargeFilter] = useState<RechargeFinanceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // reset pagination when switching tabs
  useEffect(() => {
    setPage(1);
  }, [listTab, pageSize]);

  const rechargeQuery = useFinanceRechargeRequestsQuery({
    page,
    pageSize,
    finance_status: rechargeFilter === "all" ? undefined : rechargeFilter,
  });
  const redeemQuery = useFinanceRedeemRequestsQuery({ page, pageSize });
  const genericQuery = useFinanceRequestsByTypeQuery(
    listTab === "transfer" ||
      listTab === "reset_password" ||
      listTab === "new_account_creation" ||
      listTab === "referral" ||
      listTab === "free_play"
      ? { page, pageSize, type: listTab }
      : null
  );

  const approveMutation = useFinanceApproveRechargeRequest();
  const approvePTMutation = useFinanceApprovePTRechargeRequest();
  const rejectMutation = useFinanceRejectRechargeRequest();
  const verifyMutation = useFinanceVerifyPaymentRechargeRequest();
  const rejectVerificationMutation = useFinanceRejectVerificationRechargeRequest();

  const approveLoading = approveMutation.isPending || approvePTMutation.isPending;

  const busyId =
    approveMutation.isPending
      ? approveMutation.variables?.requestId ?? null
      : approvePTMutation.isPending
        ? approvePTMutation.variables?.rechargeId ?? null
        : rejectMutation.isPending
          ? rejectMutation.variables?.requestId ?? null
          : verifyMutation.isPending
            ? verifyMutation.variables?.requestId ?? null
            : rejectVerificationMutation.isPending
              ? rejectVerificationMutation.variables?.requestId ?? null
              : null;
  const busyAction = approveMutation.isPending || approvePTMutation.isPending
    ? "approve"
    : rejectMutation.isPending
      ? "reject"
      : verifyMutation.isPending
        ? "verify"
        : rejectVerificationMutation.isPending
          ? "reject_verification"
          : null;

  const [rechargeDetail, setRechargeDetail] = useState<RechargeRequestRow | null>(null);
  const [redeemDetail, setRedeemDetail] = useState<RedeemRequestRow | null>(null);
  const [requestDetail, setRequestDetail] = useState<AppRequestRow | null>(null);
  const [approveRow, setApproveRow] = useState<RechargeRequestRow | null>(null);
  const [rejectRow, setRejectRow] = useState<RechargeRequestRow | null>(null);
  const [verifyRow, setVerifyRow] = useState<RechargeRequestRow | null>(null);
  const [rejectVerificationRow, setRejectVerificationRow] = useState<RechargeRequestRow | null>(null);

  const listTabs: { key: ActivityListTab; label: string }[] = [
    { key: "recharge", label: "Recharge Requests" },
    { key: "redeem", label: "Redeem Requests" },
    { key: "transfer", label: "Transfer Requests" },
    { key: "reset_password", label: "Reset Password Requests" },
    { key: "new_account_creation", label: "New Account Creation Requests" },
    { key: "referral", label: "Referral Requests" },
    { key: "free_play", label: "Free Play Requests" },
  ];

  const headerTabs = (
    <div className="overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max gap-4 pb-1">
        {listTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setListTab(t.key)}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              listTab === t.key
                ? "text-gray-100 border-slate-400"
                : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  const total =
    listTab === "recharge"
      ? rechargeQuery.data?.total ?? 0
      : listTab === "redeem"
        ? redeemQuery.data?.total ?? 0
        : genericQuery.data?.total ?? 0;

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Finance • Activities</h1>
          <p className="mt-1 text-sm text-gray-400">Recharge, redeem and other request activity lists.</p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-3">{headerTabs}</div>

      {listTab === "recharge" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRechargeFilter("pending")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                rechargeFilter === "pending"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
              }`}
            >
              Pending approval
            </button>
            <button
              type="button"
              onClick={() => setRechargeFilter("verification_pending")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                rechargeFilter === "verification_pending"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
              }`}
            >
              Verification pending
            </button>
            <button
              type="button"
              onClick={() => setRechargeFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                rechargeFilter === "all"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100"
              }`}
            >
              All
            </button>
          </div>
          {rechargeQuery.error ? (
            <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {rechargeQuery.error instanceof Error ? rechargeQuery.error.message : "Failed to load recharge requests."}
            </div>
          ) : null}
          <FinanceRechargeRequestsTable
            rows={rechargeQuery.data?.rows ?? []}
            loading={rechargeQuery.isLoading && !rechargeQuery.data}
            busyId={busyId}
            busyAction={busyAction}
            onView={(r) => setRechargeDetail(r)}
            onApprove={(r) => setApproveRow(r)}
            onReject={(r) => setRejectRow(r)}
            onVerify={(r) => setVerifyRow(r)}
            onRejectVerification={(r) => setRejectVerificationRow(r)}
            emptyMessage="No recharge requests."
          />
        </>
      ) : listTab === "redeem" ? (
        <>
          {redeemQuery.error ? (
            <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {redeemQuery.error instanceof Error ? redeemQuery.error.message : "Failed to load redeem requests."}
            </div>
          ) : null}
          <FinanceRedeemRequestsTable
            rows={redeemQuery.data?.rows ?? []}
            loading={redeemQuery.isLoading && !redeemQuery.data}
            emptyMessage="No redeem requests."
            onView={(row) => setRedeemDetail(row)}
          />
        </>
      ) : (
        <>
          {genericQuery.error ? (
            <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {genericQuery.error instanceof Error ? genericQuery.error.message : "Failed to load requests."}
            </div>
          ) : null}
          <RequestsTable
            headerContent={headerTabs}
            rows={(genericQuery.data?.rows ?? []).map<RequestTableRow>((r) => ({
              id: r.id,
              player: `${r.entity?.name ?? r.entity_id} • ${r.player?.name ?? r.player_id}`,
              amount: formatAmount(r.amount),
              status: r.status ?? "pending",
              created_at: r.created_at,
            }))}
            loading={genericQuery.isLoading && !genericQuery.data}
            emptyMessage="No requests."
            renderActions={(row) => (
              <button
                type="button"
                onClick={() => {
                  const full = (genericQuery.data?.rows ?? []).find((x) => x.id === row.id) ?? null;
                  setRequestDetail(full);
                }}
                className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                View
              </button>
            )}
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

      <RechargeDetailModal open={!!rechargeDetail} onClose={() => setRechargeDetail(null)} row={rechargeDetail} />
      <RedeemDetailModal open={!!redeemDetail} onClose={() => setRedeemDetail(null)} row={redeemDetail} />
      <RequestDetailModal open={!!requestDetail} onClose={() => setRequestDetail(null)} row={requestDetail} />

      <AssignPaymentAccountModal
        open={!!approveRow}
        row={approveRow}
        loading={approveLoading}
        onConfirmCT={async (paymentMethodAccountId) => {
          if (!approveRow) return;
          try {
            await approveMutation.mutateAsync({ requestId: approveRow.id, paymentMethodAccountId });
            showToast({ variant: "success", title: "Approved (CT)", description: "Payment account assigned and approved." });
            setApproveRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Approve failed",
              description: e instanceof Error ? e.message : "Unable to approve request.",
            });
          }
        }}
        onConfirmPT={async (redeemId) => {
          if (!approveRow) return;
          try {
            await approvePTMutation.mutateAsync({ rechargeId: approveRow.id, redeemId });
            showToast({ variant: "success", title: "Approved (PT)", description: "Recharge matched with redeem request." });
            setApproveRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "PT Approve failed",
              description: e instanceof Error ? e.message : "Unable to approve PT request.",
            });
          }
        }}
        onClose={() => setApproveRow(null)}
      />

      <FinanceRejectReasonModal
        open={!!rejectRow}
        onClose={() => setRejectRow(null)}
        loading={rejectMutation.isPending}
        onConfirm={async (reason) => {
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
        }}
      />

      <FinanceVerifyPaymentModal
        open={!!verifyRow}
        onClose={() => setVerifyRow(null)}
        row={verifyRow}
        loading={verifyMutation.isPending}
        onApprove={async () => {
          if (!verifyRow) return;
          try {
            await verifyMutation.mutateAsync({ requestId: verifyRow.id });
            showToast({ variant: "success", title: "Verified", description: "Payment verified and sent to Operations." });
            setVerifyRow(null);
          } catch (e) {
            showToast({ variant: "error", title: "Verify failed", description: e instanceof Error ? e.message : "Unable to verify." });
          }
        }}
        onReject={() => {
          const row = verifyRow;
          setVerifyRow(null);
          setRejectVerificationRow(row);
        }}
      />

      <FinanceRejectReasonModal
        open={!!rejectVerificationRow}
        onClose={() => setRejectVerificationRow(null)}
        loading={rejectVerificationMutation.isPending}
        onConfirm={async (reason) => {
          if (!rejectVerificationRow) return;
          try {
            await rejectVerificationMutation.mutateAsync({ requestId: rejectVerificationRow.id, reason });
            showToast({ variant: "success", title: "Rejected", description: "Payment verification rejected." });
            setRejectVerificationRow(null);
          } catch (e) {
            showToast({
              variant: "error",
              title: "Reject failed",
              description: e instanceof Error ? e.message : "Unable to reject verification.",
            });
          }
        }}
      />
    </div>
  );
}

