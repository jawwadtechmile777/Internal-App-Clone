"use client";

import Link from "next/link";
import { useVerificationRechargeRequestsQuery } from "@/hooks/useVerificationRequests";

export default function VerificationDashboardPage() {
  const pendingQuery = useVerificationRechargeRequestsQuery({
    page: 1,
    pageSize: 1,
    verification_status: "pending",
  });
  const approvedQuery = useVerificationRechargeRequestsQuery({
    page: 1,
    pageSize: 1,
    verification_status: "approved",
  });
  const rejectedQuery = useVerificationRechargeRequestsQuery({
    page: 1,
    pageSize: 1,
    verification_status: "rejected",
  });

  const cards: { label: string; count: number | null; color: string }[] = [
    {
      label: "Pending Verification",
      count: pendingQuery.data?.total ?? null,
      color: "border-amber-800 bg-amber-900/20 text-amber-200",
    },
    {
      label: "Approved",
      count: approvedQuery.data?.total ?? null,
      color: "border-emerald-800 bg-emerald-900/20 text-emerald-200",
    },
    {
      label: "Rejected",
      count: rejectedQuery.data?.total ?? null,
      color: "border-red-800 bg-red-900/20 text-red-200",
    },
  ];

  const loading = pendingQuery.isLoading || approvedQuery.isLoading || rejectedQuery.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Verification Overview</h1>
        <p className="mt-1 text-sm text-gray-400">PT recharge requests summary.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border px-5 py-4 ${c.color}`}
          >
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {loading ? "…" : (c.count ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/dashboard/verification/activities"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Go to Activities
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
