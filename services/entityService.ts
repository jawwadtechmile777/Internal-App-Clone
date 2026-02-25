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

export async function fetchGames(): Promise<GameOption[]> {
  const { data, error } = await supabase
    .from("games")
    .select("id, name")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as GameOption[];
}
