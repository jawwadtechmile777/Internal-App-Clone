import Link from "next/link";

export default function ExecutiveDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Executive</h1>
      <p className="text-slate-600">Overview and department access.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/executive/finance"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="font-medium text-slate-800">Finance</h2>
          <p className="mt-1 text-sm text-slate-500">Recharge requests — approve, verify, send to operations</p>
        </Link>
        <Link
          href="/dashboard/executive/verification"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="font-medium text-slate-800">Verification</h2>
          <p className="mt-1 text-sm text-slate-500">PT flow verification</p>
        </Link>
        <Link
          href="/dashboard/executive/operations"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="font-medium text-slate-800">Operations</h2>
          <p className="mt-1 text-sm text-slate-500">Complete recharge requests</p>
        </Link>
        <Link
          href="/dashboard/executive/support"
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <h2 className="font-medium text-slate-800">Support</h2>
          <p className="mt-1 text-sm text-slate-500">Create requests, submit payment proof</p>
        </Link>
      </div>
    </div>
  );
}
