import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export interface PlayerGameAccountRow {
  id: string;
  player_id: string;
  game_id: string;
  username: string;
  transaction_limit: number;
  created_at: string;
  player: { id: string; name: string; entity_id: string };
  game: { id: string; name: string } | null;
}

const SELECT = `
  id,
  player_id,
  game_id,
  username,
  transaction_limit,
  created_at,
  players:players!inner ( id, name, entity_id ),
  games ( id, name )
`;

function mapRow(r: Record<string, unknown>): PlayerGameAccountRow {
  return {
    id: r.id as string,
    player_id: r.player_id as string,
    game_id: r.game_id as string,
    username: (r.username as string) ?? "",
    transaction_limit: Number(r.transaction_limit ?? 0),
    created_at: (r.created_at as string) ?? "",
    player: (r.players as PlayerGameAccountRow["player"]) ?? { id: "", name: "", entity_id: "" },
    game: (r.games as PlayerGameAccountRow["game"]) ?? null,
  };
}

export async function fetchPlayerGameAccountsByEntity(entityId: string): Promise<PlayerGameAccountRow[]> {
  const { data, error } = await supabase
    .from("player_game_accounts")
    .select(SELECT)
    .eq("players.entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapRow);
}

