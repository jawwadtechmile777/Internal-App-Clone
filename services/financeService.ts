import { createClient } from "@/lib/supabaseClient";
import { canTransitionOperationsStatus } from "@/lib/statusTransitions";
import type { RechargeFinanceStatus, RechargeRequestRow, RechargeTagType } from "@/types/recharge";

const supabase = createClient();

export interface FinanceRechargeFilters {
  finance_status?: "pending" | "approved" | "rejected";
  tag_type?: RechargeTagType;
}

/** List recharge requests that Finance can act on: pending approval (no tag yet) or already tagged and waiting for support to submit payment. */
export async function fetchFinanceRechargeRequests(
  filters?: FinanceRechargeFilters
): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  return fetchRechargeRequests({
    finance_status: filters?.finance_status,
    tag_type: filters?.tag_type,
  });
}

export async function fetchFinanceRechargeRequestsPaged(params: {
  page: number;
  pageSize: number;
  finance_status?: RechargeFinanceStatus;
}): Promise<{ rows: RechargeRequestRow[]; total: number }> {
  const { fetchRechargeRequestsPaged } = await import("./rechargeService");
  return fetchRechargeRequestsPaged({
    page: params.page,
    pageSize: params.pageSize,
    filters: { finance_status: params.finance_status },
  });
}

/** Finance (initial step): approve request. */
export async function financeApprove(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  await updateRechargeRequest(requestId, {
    finance_status: "approved",
    entity_status: "payment pending",
    operations_status: "pending",
  });
}

/** Finance (initial approval): assign payment_method_account_id (CT tag) + approve, send back to Entity for payment. */
export async function financeApproveAssignPaymentAccount(params: {
  requestId: string;
  paymentMethodAccountId: string;
}): Promise<void> {
  const { fetchRechargeRequestById } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(params.requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  if (!row.payment_method_id) throw new Error("Request has no payment method");

  // Validate that the selected account is active and belongs to the same payment_method_id.
  const { data: acct, error: acctError } = await supabase
    .from("payment_method_accounts")
    .select("id, payment_method_id, status, payment_methods ( id, name )")
    .eq("id", params.paymentMethodAccountId)
    .single();
  if (acctError) throw acctError;
  if (!acct || acct.status !== "active") throw new Error("Selected bank account is not active");

  const requestPmId = row.payment_method_id;
  const requestPmName = row.payment_method?.method_name ?? null;
  const acctPmId = acct.payment_method_id as string;
  const acctPmName =
    ((acct as unknown as { payment_methods?: { id: string; name: string } | null }).payment_methods?.name as string | undefined) ??
    null;

  const nameMatches =
    !!requestPmName &&
    !!acctPmName &&
    requestPmName.trim().toLowerCase() === acctPmName.trim().toLowerCase();

  if (acctPmId !== requestPmId && !nameMatches) {
    throw new Error("Selected bank account does not match the request payment method");
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("recharge_requests")
    .update({
      finance_status: "approved",
      entity_status: "payment pending",
      operations_status: "pending",
      payment_method_account_id: params.paymentMethodAccountId,
      tag_type: "CT",
      updated_at: now,
    })
    .eq("id", params.requestId)
    .eq("finance_status", "pending");

  if (error) throw error;
}

/** Finance (initial step): reject request. */
export async function financeRejectInitial(requestId: string, reason: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  await updateRechargeRequest(requestId, {
    finance_status: "rejected",
    entity_status: "rejected",
    operations_status: "cancelled",
    remarks: reason,
  });
}

/** Finance: attach CT tag and approve → goes back to Support (entity_status stays; finance_status = approved, operations_status = waiting_operations for CT flow). */
export async function financeApproveWithCT(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  await updateRechargeRequest(requestId, {
    tag_type: "CT",
    finance_status: "approved",
    entity_status: "payment pending",
    operations_status: "pending",
  });
}

/** Finance: attach PT tag and approve → goes back to Support (verification_status = pending for PT flow). */
export async function financeApproveWithPT(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  await updateRechargeRequest(requestId, {
    tag_type: "PT",
    finance_status: "approved",
    entity_status: "payment pending",
    verification_status: "pending",
    operations_status: "pending",
  });
}

/** Finance: reject request. */
export async function financeReject(requestId: string, remarks?: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  await updateRechargeRequest(requestId, {
    finance_status: "rejected",
    remarks: remarks ?? row.remarks,
  });
}

/** Finance: after Entity submitted payment, verify and send to Operations for completion. */
export async function financeVerifyAndSendToOperations(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "verification_pending") throw new Error("Request must be in verification pending state");
  if (row.entity_status !== "payment_submitted") throw new Error("Entity must submit payment first");
  await updateRechargeRequest(requestId, {
    finance_status: "verified",
    operations_status: "processing",
  });
}

/** Finance: reject after Entity submitted payment (verification_pending). */
export async function financeRejectVerification(requestId: string, reason: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "verification_pending") throw new Error("Request is not pending verification");
  await updateRechargeRequest(requestId, {
    finance_status: "rejected",
    entity_status: "rejected",
    operations_status: "cancelled",
    remarks: reason.trim() || row.remarks,
  });
}
