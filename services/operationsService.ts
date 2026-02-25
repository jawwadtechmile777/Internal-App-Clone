import { canTransitionOperationsStatus } from "@/lib/statusTransitions";
import type { RechargeRequestRow } from "@/types/recharge";

export interface OperationsRechargeFilters {
  operations_status?: "waiting_operations" | "completed";
}

/** List recharge requests that Operations can complete (waiting_operations). */
export async function fetchOperationsRechargeRequests(
  filters?: OperationsRechargeFilters
): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  return fetchRechargeRequests({
    operations_status: filters?.operations_status ?? "waiting_operations",
  });
}

/** Operations: mark request as completed. */
export async function operationsComplete(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  const current = row.operations_status ?? "pending";
  if (!canTransitionOperationsStatus(current, "completed")) {
    throw new Error("Invalid operations status transition: only waiting_operations can be completed");
  }
  await updateRechargeRequest(requestId, {
    operations_status: "completed",
  });
}
