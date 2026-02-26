import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export interface PlayerPaymentMethodRow {
  id: string;
  player_id: string;
  method_name: string;
  details: Record<string, unknown>;
  created_at: string;
  player: { id: string; name: string; entity_id: string };
}

const SELECT = `
  id,
  player_id,
  method_name,
  details,
  created_at,
  players:players!inner ( id, name, entity_id )
`;

function mapRow(r: Record<string, unknown>): PlayerPaymentMethodRow {
  return {
    id: r.id as string,
    player_id: r.player_id as string,
    method_name: (r.method_name as string) ?? "",
    details: (r.details as Record<string, unknown>) ?? {},
    created_at: (r.created_at as string) ?? "",
    player: (r.players as PlayerPaymentMethodRow["player"]) ?? { id: "", name: "", entity_id: "" },
  };
}

export async function fetchPlayerPaymentMethodsByEntity(entityId: string): Promise<PlayerPaymentMethodRow[]> {
  const { data, error } = await supabase
    .from("player_payment_methods")
    .select(SELECT)
    .eq("players.entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
}

