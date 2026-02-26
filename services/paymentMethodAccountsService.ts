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

