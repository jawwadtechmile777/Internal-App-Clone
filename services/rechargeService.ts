import { createClient } from "@/lib/supabaseClient";
import type {
  RechargeRequestRow,
  RechargeRequestCreateInput,
  RechargeRequestUpdateInput,
} from "@/types/recharge";

const supabase = createClient();

const RECHARGE_SELECT = `
  id,
  entity_id,
  player_id,
  game_id,
  payment_method_id,
  payment_method_account_id,
  player_payment_method_id,
  amount,
  bonus_percentage,
  bonus_amount,
  final_amount,
  entity_status,
  finance_status,
  operations_status,
  verification_status,
  remarks,
  requested_by,
  created_at,
  updated_at,
  entity_payment_proof_path,
  entity_payment_submitted_at,
  tag_type,
  entities ( id, name, status ),
  players ( id, name, entity_id, status ),
  games ( id, name ),
  player_payment_methods ( id, method_name, details ),
  payment_method_accounts ( id, account_name, account_number, iban, holder_name ),
  requested_by_user:requested_by ( id )
`;

function mapRow(r: Record<string, unknown>): RechargeRequestRow {
  return {
    id: r.id as string,
    entity_id: r.entity_id as string,
    player_id: r.player_id as string,
    game_id: (r.game_id as string) ?? null,
    payment_method_id: (r.payment_method_id as string) ?? null,
    payment_method_account_id: (r.payment_method_account_id as string) ?? null,
    player_payment_method_id: (r.player_payment_method_id as string) ?? null,
    amount: Number(r.amount),
    bonus_percentage: Number(r.bonus_percentage ?? 0),
    bonus_amount: Number(r.bonus_amount ?? 0),
    final_amount: r.final_amount != null ? Number(r.final_amount) : null,
    entity_status: (r.entity_status as RechargeRequestRow["entity_status"]) ?? null,
    finance_status: (r.finance_status as RechargeRequestRow["finance_status"]) ?? null,
    operations_status: (r.operations_status as RechargeRequestRow["operations_status"]) ?? null,
    verification_status: (r.verification_status as RechargeRequestRow["verification_status"]) ?? "not_required",
    remarks: (r.remarks as string) ?? null,
    requested_by: (r.requested_by as string) ?? null,
    created_at: (r.created_at as string) ?? null,
    updated_at: (r.updated_at as string) ?? null,
    entity_payment_proof_path: (r.entity_payment_proof_path as string) ?? null,
    entity_payment_submitted_at: (r.entity_payment_submitted_at as string) ?? null,
    tag_type: (r.tag_type as RechargeRequestRow["tag_type"]) ?? null,
    entity: (r.entities as RechargeRequestRow["entity"]) ?? null,
    player: (r.players as RechargeRequestRow["player"]) ?? null,
    game: (r.games as RechargeRequestRow["game"]) ?? null,
    player_payment_method: ((r.player_payment_methods ?? (r as Record<string, unknown>).player_payment_methods_2) as RechargeRequestRow["player_payment_method"]) ?? null,
    payment_method_account: (r.payment_method_accounts as RechargeRequestRow["payment_method_account"]) ?? null,
    requested_by_user: (r.requested_by_user as RechargeRequestRow["requested_by_user"]) ?? null,
  };
}

export async function fetchRechargeRequests(filters?: {
  entity_id?: string | null;
  entity_status?: string;
  finance_status?: string;
  verification_status?: string;
  operations_status?: string;
  tag_type?: string;
}): Promise<RechargeRequestRow[]> {
  let q = supabase
    .from("recharge_requests")
    .select(RECHARGE_SELECT)
    .order("created_at", { ascending: false });

  if (filters?.entity_id != null) q = q.eq("entity_id", filters.entity_id);
  if (filters?.entity_status) q = q.eq("entity_status", filters.entity_status);
  if (filters?.finance_status) q = q.eq("finance_status", filters.finance_status);
  if (filters?.verification_status) q = q.eq("verification_status", filters.verification_status);
  if (filters?.operations_status) q = q.eq("operations_status", filters.operations_status);
  if (filters?.tag_type) q = q.eq("tag_type", filters.tag_type);

  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
}

export async function fetchRechargeRequestById(id: string): Promise<RechargeRequestRow | null> {
  const { data, error } = await supabase
    .from("recharge_requests")
    .select(RECHARGE_SELECT)
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function createRechargeRequest(
  input: RechargeRequestCreateInput
): Promise<RechargeRequestRow> {
  const amount = input.amount;
  const bonusAmount = input.bonus_amount ?? 0;
  const payload = {
    entity_id: input.entity_id,
    player_id: input.player_id,
    game_id: input.game_id ?? null,
    amount,
    bonus_percentage: input.bonus_percentage ?? 0,
    bonus_amount: bonusAmount,
    final_amount: amount + bonusAmount,
    entity_status: "pending",
    finance_status: "pending",
    operations_status: "pending",
    verification_status: "not_required",
    remarks: input.remarks ?? null,
    requested_by: input.requested_by,
  };

  const { data, error } = await supabase
    .from("recharge_requests")
    .insert(payload)
    .select(RECHARGE_SELECT)
    .single();
  if (error) throw error;
  return mapRow((data ?? {}) as Record<string, unknown>);
}

export async function updateRechargeRequest(
  id: string,
  input: RechargeRequestUpdateInput
): Promise<RechargeRequestRow> {
  const payload: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("recharge_requests")
    .update(payload)
    .eq("id", id)
    .select(RECHARGE_SELECT)
    .single();
  if (error) throw error;
  return mapRow((data ?? {}) as Record<string, unknown>);
}
