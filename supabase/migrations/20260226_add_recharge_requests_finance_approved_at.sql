-- Adds finance approval timestamp for audit trail.
alter table public.recharge_requests
  add column if not exists finance_approved_at timestamp with time zone;

