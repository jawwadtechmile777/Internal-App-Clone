# Internal App — Multi-Department Financial Routing

Next.js 14 (App Router) + TypeScript + Supabase frontend for recharge request workflows across Support, Finance, Verification, and Operations.

## Setup

1. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000). Root redirects to `/login`.

## Auth & roles

- Login uses Supabase Auth; user profile is loaded from `public.users` with `departments` join.
- Redirect after login is by department: Finance → `/dashboard/finance`, Verification → `/dashboard/verification`, Operations → `/dashboard/operations`, Support → `/dashboard/support`, Executive → `/dashboard/executive`.
- Dashboard routes are protected; unauthorized access redirects to `/unauthorized`.

## Workflows

- **CT:** Support creates → Finance (CT tag + approve) → Support (payment proof) → Finance (verify) → Operations (complete).
- **PT:** Support creates → Finance (PT tag + approve) → Support (payment proof) → Verification (approve) → Operations (complete).

State transitions are enforced in `lib/statusTransitions.ts`.

## Structure

- `app/` — Login, dashboard routes, unauthorized.
- `components/` — Tables, modals, UI, dashboard layout.
- `context/` — Auth context.
- `hooks/` — useAuth, useRechargeRequests, useFinanceRequests, etc.
- `lib/` — Supabase client, roleGuard, statusTransitions, safeJson.
- `services/` — rechargeService, financeService, verificationService, operationsService, supportService, entityService.
- `types/` — recharge, user, department.
