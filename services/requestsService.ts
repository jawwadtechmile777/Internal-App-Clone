import { createClient } from "@/lib/supabaseClient";
import type { AppRequestCreateInput, AppRequestRow } from "@/types/request";

const supabase = createClient();

const SELECT = `
  id,
  entity_id,
  player_id,
  type,
  status,
  amount,
  cp_pt_tag,
  source_game_id,
  target_game_id,
  created_by,
  assigned_to,
  remarks,
  created_at,
  updated_at,
  players ( id, name, entity_id ),
  entities ( id, name ),
  source_game:games!requests_source_game_id_fkey ( id, name ),
  target_game:games!requests_target_game_id_fkey ( id, name )
`;

function mapRow(r: Record<string, unknown>): AppRequestRow {
  return {
    id: r.id as string,
    entity_id: r.entity_id as string,
    player_id: r.player_id as string,
    type: (r.type as string) ?? "",
    status: (r.status as string) ?? "pending",
    amount: r.amount != null ? Number(r.amount) : null,
    cp_pt_tag: (r.cp_pt_tag as string) ?? null,
    source_game_id: (r.source_game_id as string) ?? null,
    target_game_id: (r.target_game_id as string) ?? null,
    created_by: (r.created_by as string) ?? "",
    assigned_to: (r.assigned_to as string) ?? null,
    remarks: (r.remarks as string) ?? null,
    created_at: (r.created_at as string) ?? "",
    updated_at: (r.updated_at as string) ?? "",
    player: (r.players as AppRequestRow["player"]) ?? null,
    entity: (r.entities as AppRequestRow["entity"]) ?? null,
    source_game: (r.source_game as AppRequestRow["source_game"]) ?? null,
    target_game: (r.target_game as AppRequestRow["target_game"]) ?? null,
  };
}

export async function fetchRequestsByEntityAndType(filters: {
  entity_id: string;
  type: string;
}): Promise<AppRequestRow[]> {
  const { data, error } = await supabase
    .from("requests")
    .select(SELECT)
    .eq("entity_id", filters.entity_id)
    .eq("type", filters.type)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
}

export async function createRequest(input: AppRequestCreateInput): Promise<AppRequestRow> {
  const payload = {
    entity_id: input.entity_id,
    player_id: input.player_id,
    type: input.type,
    amount: input.amount ?? null,
    cp_pt_tag: input.cp_pt_tag ?? null,
    source_game_id: input.source_game_id ?? null,
    target_game_id: input.target_game_id ?? null,
    created_by: input.created_by,
    remarks: input.remarks ?? null,
  };

  const { data, error } = await supabase
    .from("requests")
    .insert(payload)
    .select(SELECT)
    .single();
  if (error) throw error;
  return mapRow((data ?? {}) as Record<string, unknown>);
}

