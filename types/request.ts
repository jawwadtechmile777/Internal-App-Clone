export type AppRequestStatus = string;

export interface AppRequestRow {
  id: string;
  entity_id: string;
  player_id: string;
  type: string;
  status: AppRequestStatus;
  amount: number | null;
  cp_pt_tag: string | null;
  source_game_id: string | null;
  target_game_id: string | null;
  created_by: string;
  assigned_to: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  // joined
  player?: { id: string; name: string; entity_id: string } | null;
  entity?: { id: string; name: string } | null;
  source_game?: { id: string; name: string } | null;
  target_game?: { id: string; name: string } | null;
}

export interface AppRequestCreateInput {
  entity_id: string;
  player_id: string;
  type: string;
  amount?: number | null;
  cp_pt_tag?: string | null;
  source_game_id?: string | null;
  target_game_id?: string | null;
  created_by: string;
  remarks?: string | null;
}

