export type RechargeEntityStatus =
  | "pending"
  | "payment pending"
  | "payment_submitted"
  | "approved"
  | "rejected";

export type RechargeFinanceStatus =
  | "pending"
  | "approved"
  | "verification_pending"
  | "verified"
  | "rejected";

export type RechargeVerificationStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected";

export type RechargeOperationsStatus =
  | "pending"
  | "waiting_verification"
  | "waiting_operations"
  | "completed"
  | "rejected"
  | "cancelled";

export type RechargeTagType = "CT" | "PT";

export interface RechargeRequestRow {
  id: string;
  entity_id: string;
  player_id: string;
  game_id: string | null;
  payment_method_id: string | null;
  payment_method_account_id: string | null;
  player_payment_method_id: string | null;
  amount: number;
  bonus_percentage: number;
  bonus_amount: number;
  final_amount: number | null;
  entity_status: RechargeEntityStatus | null;
  finance_status: RechargeFinanceStatus | null;
  operations_status: RechargeOperationsStatus | null;
  verification_status: RechargeVerificationStatus;
  remarks: string | null;
  requested_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  entity_payment_proof_path: string | null;
  entity_payment_submitted_at: string | null;
  tag_type: RechargeTagType | null;
  // Joined relations
  entity?: { id: string; name: string; status: string } | null;
  player?: { id: string; name: string; entity_id: string; status: string } | null;
  game?: { id: string; name: string } | null;
  /** Player payment method selected at request creation (FK: payment_method_id). */
  payment_method?: { id: string; method_name: string; details: Record<string, unknown> } | null;
  /** Player payment method used as PT tag details (FK: player_payment_method_id). */
  pt_payment_method?: { id: string; method_name: string; details: Record<string, unknown> } | null;
  /** Company/bank account used as CT tag details (FK: payment_method_account_id). */
  payment_method_account?: {
    id: string;
    account_name: string;
    account_number: string;
    iban: string | null;
    holder_name: string;
    payment_method?: { id: string; name: string } | null;
  } | null;
  requested_by_user?: { id: string } | null;
}

export interface RechargeRequestCreateInput {
  entity_id: string;
  player_id: string;
  game_id?: string | null;
  payment_method_id?: string | null;
  amount: number;
  bonus_percentage?: number;
  bonus_amount?: number;
  remarks?: string | null;
  requested_by: string;
}

export interface RechargeRequestUpdateInput {
  entity_status?: RechargeEntityStatus;
  finance_status?: RechargeFinanceStatus;
  verification_status?: RechargeVerificationStatus;
  operations_status?: RechargeOperationsStatus;
  tag_type?: RechargeTagType | null;
  payment_method_account_id?: string | null;
  entity_payment_proof_path?: string | null;
  entity_payment_submitted_at?: string | null;
  remarks?: string | null;
  updated_at?: string;
}
