"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RequestsTable, type RequestTableRow } from "@/components/entity/RequestsTable";
import { RechargeRequestsTable } from "@/components/entity/RechargeRequestsTable";
import { useRechargeRequests } from "@/hooks/useRechargeRequests";
import { useRedeemRequests } from "@/hooks/useRedeemRequests";
import { useRequests } from "@/hooks/useRequests";
import type { RechargeRequestRow } from "@/types/recharge";
import type { RedeemRequestRow } from "@/types/redeem";
import type { AppRequestRow } from "@/types/request";
import { RechargeDetailModal } from "@/components/modals/RechargeDetailModal";
import { RedeemDetailModal } from "@/components/modals/RedeemDetailModal";
import { CreateRechargeRequestModal } from "@/components/modals/CreateRechargeRequestModal";
import { CreateRedeemModal } from "@/components/modals/CreateRedeemModal";
import { CreateRequestModal, type GenericRequestKey, GENERIC_REQUEST_LABEL_BY_KEY } from "@/components/modals/CreateRequestModal";
import { RequestDetailModal } from "@/components/modals/RequestDetailModal";
import { UploadPaymentProofModal } from "@/components/modals/UploadPaymentProofModal";
// submit payment handled inside UploadPaymentProofModal

type ActivityListTab =
  | "recharge"
  | "redeem"
  | "transfer"
  | "reset_password"
  | "new_account_creation"
  | "referral"
  | "free_play";

interface ActivitiesTabProps {
  entityId: string;
  actorUserId: string;
  /** If set, restrict create actions to this entity (Support Admin). */
  restrictedEntityId?: string | null;
}

function formatAmount(n: number | null): string {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function getRechargeOverallStatus(r: RechargeRequestRow): string | null {
  if (r.operations_status === "completed") return "completed";
  if (r.operations_status && r.operations_status !== "pending") return r.operations_status;
  if (r.tag_type === "PT" && r.verification_status && r.verification_status !== "not_required") {
    return r.verification_status;
  }
  if (r.finance_status && r.finance_status !== "pending") return r.finance_status;
  return r.entity_status ?? "pending";
}

export function ActivitiesTab({ entityId, actorUserId, restrictedEntityId }: ActivitiesTabProps) {
  const [listTab, setListTab] = useState<ActivityListTab>("recharge");
  const [rechargeDetail, setRechargeDetail] = useState<RechargeRequestRow | null>(null);
  const [redeemDetail, setRedeemDetail] = useState<RedeemRequestRow | null>(null);
  const [requestDetail, setRequestDetail] = useState<AppRequestRow | null>(null);
  const [submitPaymentRow, setSubmitPaymentRow] = useState<RechargeRequestRow | null>(null);
  const [createRechargeOpen, setCreateRechargeOpen] = useState(false);
  const [createRedeemOpen, setCreateRedeemOpen] = useState(false);
  const [createRequestKey, setCreateRequestKey] = useState<GenericRequestKey | null>(null);

  const recharge = useRechargeRequests({ entity_id: entityId });
  const redeem = useRedeemRequests({ entity_id: entityId });
  const generic = useRequests(
    listTab === "transfer" ||
      listTab === "reset_password" ||
      listTab === "new_account_creation" ||
      listTab === "referral" ||
      listTab === "free_play"
      ? { entity_id: entityId, type: listTab }
      : null
  );

  const rechargeRows: RequestTableRow[] = useMemo(() => {
    return recharge.data.map((r) => ({
      id: r.id,
      player: r.player?.name ?? r.player_id,
      amount: formatAmount(r.final_amount ?? r.amount),
      status: getRechargeOverallStatus(r),
      created_at: r.created_at,
    }));
  }, [recharge.data]);

  const redeemRows: RequestTableRow[] = useMemo(() => {
    return redeem.data.map((r) => ({
      id: r.id,
      player: r.player?.name ?? r.player_id,
      amount: formatAmount(r.total_amount),
      status: r.status ?? "pending",
      created_at: r.created_at,
    }));
  }, [redeem.data]);

  const activeTabButton = "bg-slate-600 text-white";
  const inactiveTabButton = "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-gray-100";

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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="flex flex-nowrap gap-2">
          <Button size="sm" type="button" onClick={() => { setCreateRechargeOpen(true); setListTab("recharge"); }}>
            Recharge
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => { setCreateRedeemOpen(true); setListTab("redeem"); }}>
            Redeem
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => { setCreateRequestKey("transfer"); setListTab("transfer"); }}>
            Transfer
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => { setCreateRequestKey("reset_password"); setListTab("reset_password"); }}>
            Reset Password
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => { setCreateRequestKey("new_account_creation"); setListTab("new_account_creation"); }}>
            New Account Creation
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => { setCreateRequestKey("referral"); setListTab("referral"); }}>
            Referral
          </Button>
          <Button size="sm" type="button" variant="secondary" onClick={() => { setCreateRequestKey("free_play"); setListTab("free_play"); }}>
            Free play
          </Button>
        </div>
      </div>

      {listTab === "recharge" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-3">
            {headerTabs}
          </div>
          <RechargeRequestsTable
            rows={recharge.data}
            loading={recharge.loading}
            showSubmitPayment
            onView={(row) => setRechargeDetail(row)}
            onSubmitPayment={(row) => setSubmitPaymentRow(row)}
          />
        </div>
      )}

      {listTab === "redeem" && (
        <RequestsTable
          headerContent={headerTabs}
          rows={redeemRows}
          loading={redeem.loading}
          emptyMessage="No redeem requests for this entity."
          renderActions={(row) => (
            <button
              type="button"
              onClick={() => {
                const full = redeem.data.find((x) => x.id === row.id) ?? null;
                setRedeemDetail(full);
              }}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              View
            </button>
          )}
        />
      )}

      {(listTab === "transfer" ||
        listTab === "reset_password" ||
        listTab === "new_account_creation" ||
        listTab === "referral" ||
        listTab === "free_play") && (
        <RequestsTable
          headerContent={headerTabs}
          rows={(generic.data ?? []).map((r) => ({
            id: r.id,
            player: r.player?.name ?? r.player_id,
            amount: r.amount != null ? formatAmount(r.amount) : "—",
            status: r.status ?? "pending",
            created_at: r.created_at,
          }))}
          loading={generic.loading}
          emptyMessage="No requests for this entity."
          renderActions={(row) => (
            <button
              type="button"
              onClick={() => {
                const full = generic.data.find((x) => x.id === row.id) ?? null;
                setRequestDetail(full);
              }}
              className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              View
            </button>
          )}
        />
      )}

      <RechargeDetailModal open={!!rechargeDetail} onClose={() => setRechargeDetail(null)} row={rechargeDetail} />
      <RedeemDetailModal open={!!redeemDetail} onClose={() => setRedeemDetail(null)} row={redeemDetail} />
      <RequestDetailModal open={!!requestDetail} onClose={() => setRequestDetail(null)} row={requestDetail} />
      <UploadPaymentProofModal
        open={!!submitPaymentRow}
        onClose={() => setSubmitPaymentRow(null)}
        row={submitPaymentRow}
        onSubmitted={async () => {
          await recharge.refetch();
        }}
      />

      <CreateRechargeRequestModal
        open={createRechargeOpen}
        onClose={() => setCreateRechargeOpen(false)}
        entityId={restrictedEntityId ?? entityId}
        requestedByUserId={actorUserId}
        onCreated={() => recharge.refetch()}
      />
      <CreateRedeemModal
        open={createRedeemOpen}
        onClose={() => setCreateRedeemOpen(false)}
        createdByUserId={actorUserId}
        entityId={restrictedEntityId ?? entityId}
        onCreated={() => redeem.refetch()}
      />

      {createRequestKey && (
        <CreateRequestModal
          open={!!createRequestKey}
          onClose={() => setCreateRequestKey(null)}
          createdByUserId={actorUserId}
          entityId={restrictedEntityId ?? entityId}
          requestKey={createRequestKey}
          onCreated={() => generic.refetch()}
        />
      )}
    </div>
  );
}

