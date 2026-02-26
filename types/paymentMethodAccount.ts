export type PaymentMethodAccountStatus = "active" | "inactive";

export interface PaymentMethodAccountRow {
  id: string;
  payment_method_id: string;
  account_name: string;
  account_number: string;
  iban: string | null;
  holder_name: string;
  is_default: boolean;
  status: PaymentMethodAccountStatus;
  created_at: string | null;
  updated_at: string | null;
  payment_method_name: string | null;
}

