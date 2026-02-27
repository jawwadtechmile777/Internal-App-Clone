import type { RechargeRequestRow, RechargeOperationsStatus } from "@/types/recharge";

export interface OperationsRechargeFilters {
  operations_status?: RechargeOperationsStatus | "all";
}

/**
 * List recharge requests for Operations.
 * Actionable requests come from two paths:
 *   CT flow: operations_status = 'processing' AND finance_status = 'verified'
 *   PT flow: operations_status = 'waiting_operations' AND verification_status = 'approved'
 */
export async function fetchOperationsRechargeRequests(
  filters?: OperationsRechargeFilters
): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  const status = filters?.operations_status ?? "processing";

  if (status === "all") {
    const [processing, waitingOps, completed, rejected] = await Promise.all([
      fetchRechargeRequests({ operations_status: "processing" }),
      fetchRechargeRequests({ operations_status: "waiting_operations" }),
      fetchRechargeRequests({ operations_status: "completed" }),
      fetchRechargeRequests({ operations_status: "rejected" }),
    ]);
    const seen = new Set<string>();
    const merged: RechargeRequestRow[] = [];
    for (const r of [...processing, ...waitingOps, ...completed, ...rejected]) {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); }
    }
    return merged;
  }

  return fetchRechargeRequests({ operations_status: status });
}

/** Paged variant for the Operations activities page. */
export async function fetchOperationsRechargeRequestsPaged(params: {
  page: number;
  pageSize: number;
  operations_status?: RechargeOperationsStatus | "all";
}): Promise<{ rows: RechargeRequestRow[]; total: number }> {
  const { fetchRechargeRequestsPaged } = await import("./rechargeService");
  const status = params.operations_status ?? "processing";

  if (status === "all") {
    return fetchRechargeRequestsPaged({
      page: params.page,
      pageSize: params.pageSize,
      filters: {},
    });
  }

  return fetchRechargeRequestsPaged({
    page: params.page,
    pageSize: params.pageSize,
    filters: { operations_status: status },
  });
}

/**
 * Operations: finalize a recharge request — sets all statuses to completed.
 * CT path: requires finance_status = 'verified', operations_status = 'processing'
 * PT path: requires verification_status = 'approved', operations_status = 'waiting_operations'
 */
export async function operationsComplete(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");

  const isPT = row.tag_type === "PT";
  const actionable = isPT
    ? row.operations_status === "waiting_operations" && row.verification_status === "approved"
    : row.operations_status === "processing" && row.finance_status === "verified";

  if (!actionable) {
    if (isPT) {
      throw new Error("PT request must be verified before Operations can complete (verification_status must be 'approved', operations_status must be 'waiting_operations')");
    }
    throw new Error("CT request must be finance-verified before Operations can complete (finance_status must be 'verified', operations_status must be 'processing')");
  }

  await updateRechargeRequest(requestId, {
    operations_status: "completed",
    entity_status: "completed",
    finance_status: "completed",
  });
}

/**
 * Operations: reject a recharge request.
 * Accepts both processing (CT) and waiting_operations (PT).
 */
export async function operationsReject(requestId: string, reason: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");

  if (row.operations_status !== "processing" && row.operations_status !== "waiting_operations") {
    throw new Error("Only requests in processing or waiting_operations status can be rejected");
  }

  await updateRechargeRequest(requestId, {
    operations_status: "rejected",
    entity_status: "rejected",
    remarks: reason.trim() || row.remarks,
  });
}
