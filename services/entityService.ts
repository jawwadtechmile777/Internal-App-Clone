import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export interface EntityOption {
  id: string;
  name: string;
  status: string;
}

export interface PlayerOption {
  id: string;
  name: string;
  entity_id: string;
  status: string;
}

export interface GameOption {
  id: string;
  name: string;
}

export async function fetchEntities(): Promise<EntityOption[]> {
  const { data, error } = await supabase
    .from("entities")
    .select("id, name, status")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as EntityOption[];
}

export async function fetchEntityById(entityId: string): Promise<EntityOption | null> {
  const { data, error } = await supabase
    .from("entities")
    .select("id, name, status")
    .eq("id", entityId)
    .single();
  if (error || !data) return null;
  return data as EntityOption;
}

export async function fetchPlayersByEntity(entityId: string | null): Promise<PlayerOption[]> {
  if (!entityId) return [];
  const { data, error } = await supabase
    .from("players")
    .select("id, name, entity_id, status")
    .eq("entity_id", entityId)
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as PlayerOption[];
}

export async function searchPlayersByEntity(params: {
  entityId: string;
  query: string;
  limit?: number;
}): Promise<PlayerOption[]> {
  const q = params.query.trim();
  if (!q) return [];
  const limit = params.limit ?? 10;
  const { data, error } = await supabase
    .from("players")
    .select("id, name, entity_id, status")
    .eq("entity_id", params.entityId)
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PlayerOption[];
}

export interface PlayerGameOption {
  id: string;
  name: string;
}

export async function fetchGamesByPlayer(playerId: string): Promise<PlayerGameOption[]> {
  const { data, error } = await supabase
    .from("player_game_accounts")
    .select("games ( id, name )")
    .eq("player_id", playerId);
  if (error) throw error;

  const map = new Map<string, PlayerGameOption>();
  (data ?? []).forEach((row) => {
    const g = (row as unknown as { games?: PlayerGameOption | null }).games;
    if (g?.id) map.set(g.id, g);
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export interface PlayerPaymentMethodOption {
  id: string;
  method_name: string;
  details: Record<string, unknown>;
}

export async function fetchPaymentMethodsByPlayer(playerId: string): Promise<PlayerPaymentMethodOption[]> {
  const { data, error } = await supabase
    .from("player_payment_methods")
    .select("id, method_name, details, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlayerPaymentMethodOption[];
}

export async function fetchPlayerEntityId(playerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("players")
    .select("entity_id")
    .eq("id", playerId)
    .single();
  if (error || !data) return null;
  return (data as { entity_id: string | null }).entity_id ?? null;
}

export async function fetchGames(): Promise<GameOption[]> {
  const { data, error } = await supabase
    .from("games")
    .select("id, name")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as GameOption[];
}
