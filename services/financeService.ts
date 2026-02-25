import { createClient } from "@/lib/supabaseClient";
import { canTransitionOperationsStatus } from "@/lib/statusTransitions";
import type { RechargeRequestRow, RechargeTagType } from "@/types/recharge";

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

/** Finance: attach CT tag and approve → goes back to Support (entity_status stays; finance_status = approved, operations_status = waiting_operations for CT flow). */
export async function financeApproveWithCT(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.finance_status !== "pending") throw new Error("Request is not pending finance approval");
  await updateRechargeRequest(requestId, {
    tag_type: "CT",
    finance_status: "approved",
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

/** Finance: after Support submitted payment (CT flow), verify and send to Operations. */
export async function financeVerifyAndSendToOperations(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.tag_type !== "CT") throw new Error("Only CT flow is verified by Finance");
  if (row.finance_status !== "approved") throw new Error("Request must be approved by Finance first");
  if (row.entity_status !== "payment_submitted") throw new Error("Support must submit payment first");
  const currentOp = row.operations_status ?? "pending";
  if (!canTransitionOperationsStatus(currentOp, "waiting_operations")) {
    throw new Error("Invalid operations status transition");
  }
  await updateRechargeRequest(requestId, {
    operations_status: "waiting_operations",
  });
}
