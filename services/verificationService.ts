import { createClient } from "@/lib/supabaseClient";
import type { RechargeRequestRow, RechargeVerificationStatus } from "@/types/recharge";

const supabase = createClient();

export interface LinkedRedeemData {
  id: string;
  player_id: string;
  total_amount: number;
  remaining_amount: number;
  hold_amount: number;
  status: string | null;
  player: { id: string; name: string; entity_id: string } | null;
  payment_method: { id: string; method_name: string; details: Record<string, unknown> } | null;
}

/** Fetch the linked redeem request for a PT recharge (on-demand, not in the base query). */
export async function fetchLinkedRedeem(redeemId: string): Promise<LinkedRedeemData | null> {
  const { data, error } = await supabase
    .from("redeem_requests")
    .select(`
      id,
      player_id,
      total_amount,
      remaining_amount,
      hold_amount,
      status,
      players ( id, name, entity_id ),
      payment_method:player_payment_methods ( id, method_name, details )
    `)
    .eq("id", redeemId)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    player_id: row.player_id as string,
    total_amount: Number(row.total_amount ?? 0),
    remaining_amount: Number(row.remaining_amount ?? 0),
    hold_amount: Number(row.hold_amount ?? 0),
    status: (row.status as string) ?? null,
    player: (row.players as LinkedRedeemData["player"]) ?? null,
    payment_method: (row.payment_method as LinkedRedeemData["payment_method"]) ?? null,
  };
}

export interface VerificationRechargeFilters {
  verification_status?: RechargeVerificationStatus | "all";
}

/**
 * Fetch PT recharge requests for Verification department.
 * Default filter: pending (entity has submitted payment, awaiting verification).
 */
export async function fetchVerificationRechargeRequests(
  filters?: VerificationRechargeFilters
): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  const status = filters?.verification_status ?? "pending";

  if (status === "all") {
    return fetchRechargeRequests({ tag_type: "PT" });
  }

  const rows = await fetchRechargeRequests({
    tag_type: "PT",
    verification_status: status,
  });

  if (status === "pending") {
    return rows.filter((r) => r.entity_status === "payment_submitted");
  }
  return rows;
}

/** Paged variant for activities page. */
export async function fetchVerificationRechargeRequestsPaged(params: {
  page: number;
  pageSize: number;
  verification_status?: RechargeVerificationStatus | "all";
}): Promise<{ rows: RechargeRequestRow[]; total: number }> {
  const { fetchRechargeRequestsPaged } = await import("./rechargeService");
  const status = params.verification_status ?? "pending";

  if (status === "all") {
    return fetchRechargeRequestsPaged({
      page: params.page,
      pageSize: params.pageSize,
      filters: { tag_type: "PT" },
    });
  }

  const result = await fetchRechargeRequestsPaged({
    page: params.page,
    pageSize: params.pageSize,
    filters: { tag_type: "PT", verification_status: status },
  });

  if (status === "pending") {
    const filtered = result.rows.filter((r) => r.entity_status === "payment_submitted");
    return { rows: filtered, total: filtered.length };
  }
  return result;
}

/** Verification: approve PT request → moves to Operations (waiting_operations). Verification does NOT complete the process. */
export async function verificationApprove(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.tag_type !== "PT") throw new Error("Only PT requests are handled by Verification");
  if (row.verification_status !== "pending") throw new Error("Request is not pending verification");
  if (!row.entity_payment_proof_path) throw new Error("Payment screenshot is required before approval");

  await updateRechargeRequest(requestId, {
    verification_status: "approved",
    operations_status: "waiting_operations",
  });
}

/** Verification: reject PT request → all statuses set to rejected/cancelled. */
export async function verificationReject(requestId: string, reason?: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.tag_type !== "PT") throw new Error("Only PT requests are handled by Verification");
  if (row.verification_status !== "pending") throw new Error("Request is not pending verification");

  await updateRechargeRequest(requestId, {
    verification_status: "rejected",
    entity_status: "rejected",
    finance_status: "rejected",
    operations_status: "cancelled",
    remarks: reason?.trim() || row.remarks,
  });
}
