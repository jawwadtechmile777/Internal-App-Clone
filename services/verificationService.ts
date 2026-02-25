import { canTransitionVerificationStatus } from "@/lib/statusTransitions";
import type { RechargeRequestRow } from "@/types/recharge";

export interface VerificationRechargeFilters {
  verification_status?: "pending" | "approved" | "rejected";
}

/** List recharge requests that Verification can act on (PT flow only). */
export async function fetchVerificationRechargeRequests(
  filters?: VerificationRechargeFilters
): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  const rows = await fetchRechargeRequests({
    verification_status: filters?.verification_status ?? "pending",
    tag_type: "PT",
  });
  return rows.filter((r) => r.tag_type === "PT" && r.verification_status === "pending");
}

/** Verification: approve PT request and move to Operations (waiting_operations). */
export async function verificationApprove(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.tag_type !== "PT") throw new Error("Only PT flow is handled by Verification");
  if (!canTransitionVerificationStatus(row.verification_status, "approved")) {
    throw new Error("Invalid verification status transition");
  }
  await updateRechargeRequest(requestId, {
    verification_status: "approved",
    operations_status: "waiting_operations",
  });
}

/** Verification: reject PT request. */
export async function verificationReject(requestId: string, remarks?: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.tag_type !== "PT") throw new Error("Only PT flow is handled by Verification");
  if (!canTransitionVerificationStatus(row.verification_status, "rejected")) {
    throw new Error("Invalid verification status transition");
  }
  await updateRechargeRequest(requestId, {
    verification_status: "rejected",
    remarks: remarks ?? row.remarks,
  });
}
