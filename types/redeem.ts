export type RedeemFlowType = "CT" | "PT";

/**
 * `redeem_requests.status` is not constrained in the schema snippet (defaults to 'pending').
 * Keep it as string, but we still treat common values consistently in UI.
 */
export type RedeemStatus = string;

export interface RedeemRequestRow {
  id: string;
  player_id: string;
  entity_id: string;
  game_id: string | null;
  total_amount: number;
  paid_amount: number;
  hold_amount: number;
  remaining_amount: number;
  flow_type: RedeemFlowType;
  support_status: string | null;
  finance_status: string | null;
  verification_status: string | null;
  operations_status: string | null;
  status: RedeemStatus | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  // joined
  player?: { id: string; name: string; entity_id: string } | null;
  entity?: { id: string; name: string } | null;
  game?: { id: string; name: string } | null;
}

export interface RedeemRequestCreateInput {
  entity_id: string;
  player_id: string;
  game_id?: string | null;
  total_amount: number;
  flow_type?: RedeemFlowType;
  created_by: string;
  remarks?: string | null;
}

