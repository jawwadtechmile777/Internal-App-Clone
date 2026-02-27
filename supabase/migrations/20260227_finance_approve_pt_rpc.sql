-- Add pt_redeem_id column to recharge_requests if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'recharge_requests'
      AND column_name = 'pt_redeem_id'
  ) THEN
    ALTER TABLE public.recharge_requests
      ADD COLUMN pt_redeem_id UUID REFERENCES public.redeem_requests(id);
  END IF;
END $$;

-- Atomic RPC: Finance approves a recharge request with a PT tag linked to a redeem request.
-- Validates eligibility, updates both tables in a single transaction.
CREATE OR REPLACE FUNCTION public.finance_approve_pt(
  p_recharge_id UUID,
  p_redeem_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recharge RECORD;
  v_redeem   RECORD;
BEGIN
  -- Lock the recharge row
  SELECT id, amount, finance_status, entity_id, player_payment_method_id
    INTO v_recharge
    FROM public.recharge_requests
   WHERE id = p_recharge_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recharge request not found: %', p_recharge_id;
  END IF;

  IF v_recharge.finance_status <> 'pending' THEN
    RAISE EXCEPTION 'Recharge request is not pending finance approval (current: %)', v_recharge.finance_status;
  END IF;

  -- Lock the redeem row
  SELECT id, entity_id, remaining_amount, hold_amount, payment_method_id
    INTO v_redeem
    FROM public.redeem_requests
   WHERE id = p_redeem_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redeem request not found: %', p_redeem_id;
  END IF;

  -- Entity must match
  IF v_redeem.entity_id <> v_recharge.entity_id THEN
    RAISE EXCEPTION 'Entity mismatch: recharge entity % does not match redeem entity %',
      v_recharge.entity_id, v_redeem.entity_id;
  END IF;

  -- Remaining must be >= recharge amount (Cases A and B; Case C is blocked)
  IF v_redeem.remaining_amount < v_recharge.amount THEN
    RAISE EXCEPTION 'Insufficient redeem remaining amount (% < %)',
      v_redeem.remaining_amount, v_recharge.amount;
  END IF;

  -- Update recharge request
  UPDATE public.recharge_requests
     SET tag_type = 'PT',
         pt_redeem_id = p_redeem_id,
         player_payment_method_id = v_redeem.payment_method_id,
         finance_status = 'approved',
         entity_status = 'payment pending',
         verification_status = 'pending',
         operations_status = 'pending',
         updated_at = NOW()
   WHERE id = p_recharge_id;

  -- Update redeem request: move amount from remaining to hold
  UPDATE public.redeem_requests
     SET hold_amount = hold_amount + v_recharge.amount,
         remaining_amount = remaining_amount - v_recharge.amount,
         updated_at = NOW()
   WHERE id = p_redeem_id;
END;
$$;
