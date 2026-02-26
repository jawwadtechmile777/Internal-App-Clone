import { createClient } from "@/lib/supabaseClient";
import type { RedeemRequestCreateInput, RedeemRequestRow } from "@/types/redeem";

const supabase = createClient();

const REDEEM_SELECT = `
  id,
  player_id,
  entity_id,
  game_id,
  total_amount,
  paid_amount,
  hold_amount,
  remaining_amount,
  flow_type,
  support_status,
  finance_status,
  verification_status,
  operations_status,
  status,
  created_by,
  created_at,
  updated_at,
  players ( id, name, entity_id ),
  entities ( id, name ),
  games ( id, name )
`;

function mapRow(r: Record<string, unknown>): RedeemRequestRow {
  return {
    id: r.id as string,
    player_id: r.player_id as string,
    entity_id: r.entity_id as string,
    game_id: (r.game_id as string) ?? null,
    total_amount: Number(r.total_amount ?? 0),
    paid_amount: Number(r.paid_amount ?? 0),
    hold_amount: Number(r.hold_amount ?? 0),
    remaining_amount: Number(r.remaining_amount ?? 0),
    flow_type: (r.flow_type as RedeemRequestRow["flow_type"]) ?? "PT",
    support_status: (r.support_status as string) ?? null,
    finance_status: (r.finance_status as string) ?? null,
    verification_status: (r.verification_status as string) ?? null,
    operations_status: (r.operations_status as string) ?? null,
    status: (r.status as string) ?? null,
    created_by: (r.created_by as string) ?? null,
    created_at: (r.created_at as string) ?? null,
    updated_at: (r.updated_at as string) ?? null,
    player: (r.players as RedeemRequestRow["player"]) ?? null,
    entity: (r.entities as RedeemRequestRow["entity"]) ?? null,
    game: (r.games as RedeemRequestRow["game"]) ?? null,
  };
}

export async function fetchRedeemRequests(filters: { entity_id: string }): Promise<RedeemRequestRow[]> {
  const { data, error } = await supabase
    .from("redeem_requests")
    .select(REDEEM_SELECT)
    .eq("entity_id", filters.entity_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
}

export async function fetchRedeemRequestById(id: string): Promise<RedeemRequestRow | null> {
  const { data, error } = await supabase
    .from("redeem_requests")
    .select(REDEEM_SELECT)
    .eq("id", id)
    .single();
  if (error) {
    // PGRST116 = row not found
    const code = (error as { code?: string }).code;
    if (code === "PGRST116") return null;
    throw error;
  }
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function createRedeemRequest(input: RedeemRequestCreateInput): Promise<RedeemRequestRow> {
  const total = input.total_amount;
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Total amount must be a positive number.");
  }

  const payload = {
    entity_id: input.entity_id,
    player_id: input.player_id,
    game_id: input.game_id ?? null,
    total_amount: total,
    paid_amount: 0,
    hold_amount: 0,
    remaining_amount: total,
    flow_type: input.flow_type ?? "PT",
    created_by: input.created_by,
    remarks: input.remarks ?? null,
  };

  const { data, error } = await supabase
    .from("redeem_requests")
    .insert(payload)
    .select(REDEEM_SELECT)
    .single();
  if (error) throw error;
  return mapRow((data ?? {}) as Record<string, unknown>);
}

