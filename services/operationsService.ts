import type { RechargeRequestRow, RechargeOperationsStatus } from "@/types/recharge";

export interface OperationsRechargeFilters {
  operations_status?: "processing" | "completed" | "all";
}

/** List recharge requests for Operations: defaults to processing (ready for completion). */
export async function fetchOperationsRechargeRequests(
  filters?: OperationsRechargeFilters
): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  const status = filters?.operations_status ?? "processing";

  if (status === "all") {
    const [processing, completed] = await Promise.all([
      fetchRechargeRequests({ operations_status: "processing", finance_status: "verified" }),
      fetchRechargeRequests({ operations_status: "completed" }),
    ]);
    const seen = new Set<string>();
    const merged: RechargeRequestRow[] = [];
    for (const r of [...processing, ...completed]) {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); }
    }
    return merged;
  }

  return fetchRechargeRequests({
    operations_status: status,
    finance_status: status === "completed" ? undefined : "verified",
  });
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
    filters: {
      operations_status: status,
      ...(status === "completed" ? {} : { finance_status: "verified" }),
    },
  });
}

/** Operations: finalize a recharge request — sets all statuses to completed. */
export async function operationsComplete(requestId: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.operations_status !== "processing") {
    throw new Error("Only requests in processing status can be completed");
  }
  if (row.finance_status !== "verified") {
    throw new Error("Finance must verify payment before Operations can complete");
  }
  await updateRechargeRequest(requestId, {
    operations_status: "completed",
    entity_status: "completed",
    finance_status: "completed",
  });
}

/** Operations: reject a recharge request. */
export async function operationsReject(requestId: string, reason: string): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.operations_status !== "processing") {
    throw new Error("Only requests in processing status can be rejected");
  }
  await updateRechargeRequest(requestId, {
    operations_status: "rejected",
    entity_status: "rejected",
    remarks: reason.trim() || row.remarks,
  });
}
