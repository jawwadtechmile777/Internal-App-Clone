import type { RechargeRequestRow } from "@/types/recharge";

/** List recharge requests that Support can act on: created by them or pending payment submission (finance approved, waiting for screenshot). */
export async function fetchSupportRechargeRequests(filters?: {
  entity_status?: "pending" | "payment_submitted";
}): Promise<RechargeRequestRow[]> {
  const { fetchRechargeRequests } = await import("./rechargeService");
  return fetchRechargeRequests({
    entity_status: filters?.entity_status,
  });
}

/** Support: submit payment proof and move to next step (Finance for CT, Verification for PT). */
export async function supportSubmitPaymentProof(
  requestId: string,
  entityPaymentProofPath: string,
  paymentMethodAccountId?: string | null
): Promise<void> {
  const { fetchRechargeRequestById, updateRechargeRequest } = await import("./rechargeService");
  const row = await fetchRechargeRequestById(requestId);
  if (!row) throw new Error("Request not found");
  if (row.entity_status === "payment_submitted") throw new Error("Payment already submitted");
  if (row.finance_status !== "approved") throw new Error("Finance must approve before Support can submit payment");
  await updateRechargeRequest(requestId, {
    entity_status: "payment_submitted",
    entity_payment_proof_path: entityPaymentProofPath,
    entity_payment_submitted_at: new Date().toISOString(),
    payment_method_account_id: paymentMethodAccountId ?? row.payment_method_account_id,
  });
}
