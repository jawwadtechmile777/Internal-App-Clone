import { createClient } from "@/lib/supabaseClient";
import type { PaymentMethodAccountRow } from "@/types/paymentMethodAccount";

const supabase = createClient();

const SELECT = `
  id,
  payment_method_id,
  account_name,
  account_number,
  iban,
  holder_name,
  is_default,
  status,
  created_at,
  updated_at,
  payment_method:payment_methods ( id, name )
`;

function mapRow(r: Record<string, unknown>): PaymentMethodAccountRow {
  const pm = (r.payment_method as { id: string; name: string } | null | undefined) ?? null;
  return {
    id: r.id as string,
    payment_method_id: r.payment_method_id as string,
    account_name: (r.account_name as string) ?? "",
    account_number: (r.account_number as string) ?? "",
    iban: (r.iban as string) ?? null,
    holder_name: (r.holder_name as string) ?? "",
    is_default: Boolean(r.is_default),
    status: (r.status as PaymentMethodAccountRow["status"]) ?? "inactive",
    created_at: (r.created_at as string) ?? null,
    updated_at: (r.updated_at as string) ?? null,
    payment_method_name: pm?.name ?? null,
  };
}

export async function fetchActivePaymentMethodAccountsByPaymentMethodId(
  paymentMethodId: string
): Promise<PaymentMethodAccountRow[]> {
  const { data, error } = await supabase
    .from("payment_method_accounts")
    .select(SELECT)
    .eq("status", "active")
    .eq("payment_method_id", paymentMethodId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
}

async function resolvePaymentMethodIdByName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const exact = await supabase.from("payment_methods").select("id").eq("name", trimmed).maybeSingle();
  if (exact.error) throw exact.error;
  if (exact.data?.id) return exact.data.id as string;

  const ilike = await supabase
    .from("payment_methods")
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle();
  if (ilike.error) throw ilike.error;
  return (ilike.data?.id as string) ?? null;
}

/**
 * Fetch active company/bank accounts for a recharge request payment method.
 *
 * In some deployments, `recharge_requests.payment_method_id` stores a user/payment record (eg `player_payment_methods.id`)
 * while `payment_method_accounts.payment_method_id` stores the bank (`payment_methods.id`).
 *
 * To be robust, we try:
 * - direct match by id
 * - if that returns empty, resolve bank id by payment method name and query again
 */
export async function fetchActivePaymentMethodAccountsForRechargePaymentMethod(params: {
  paymentMethodId?: string | null;
  paymentMethodName?: string | null;
}): Promise<PaymentMethodAccountRow[]> {
  const id = params.paymentMethodId ?? null;
  const name = params.paymentMethodName ?? null;

  if (id) {
    const direct = await fetchActivePaymentMethodAccountsByPaymentMethodId(id);
    if (direct.length > 0) return direct;
  }

  if (name) {
    const resolvedId = await resolvePaymentMethodIdByName(name);
    if (resolvedId) return fetchActivePaymentMethodAccountsByPaymentMethodId(resolvedId);
  }

  return [];
}

