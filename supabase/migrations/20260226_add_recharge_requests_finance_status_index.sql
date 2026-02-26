-- Performance: speed up finance dashboard filters.
-- Note: In production, consider CONCURRENTLY (requires running outside a transaction).

create index if not exists recharge_requests_finance_status_idx
  on public.recharge_requests (finance_status);

