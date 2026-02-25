import Link from "next/link";

export default function ExecutiveDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-100">Executive</h1>
      <p className="text-gray-400">Overview and department access.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/executive/finance"
          className="rounded-xl border border-gray-700 bg-slate-800/80 p-4 shadow-sm transition hover:border-gray-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <h2 className="font-medium text-gray-100">Finance</h2>
          <p className="mt-1 text-sm text-gray-400">Recharge requests — approve, verify, send to operations</p>
        </Link>
        <Link
          href="/dashboard/executive/verification"
          className="rounded-xl border border-gray-700 bg-slate-800/80 p-4 shadow-sm transition hover:border-gray-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <h2 className="font-medium text-gray-100">Verification</h2>
          <p className="mt-1 text-sm text-gray-400">PT flow verification</p>
        </Link>
        <Link
          href="/dashboard/executive/operations"
          className="rounded-xl border border-gray-700 bg-slate-800/80 p-4 shadow-sm transition hover:border-gray-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <h2 className="font-medium text-gray-100">Operations</h2>
          <p className="mt-1 text-sm text-gray-400">Complete recharge requests</p>
        </Link>
        <Link
          href="/dashboard/executive/support"
          className="rounded-xl border border-gray-700 bg-slate-800/80 p-4 shadow-sm transition hover:border-gray-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <h2 className="font-medium text-gray-100">Support</h2>
          <p className="mt-1 text-sm text-gray-400">Create requests, submit payment proof</p>
        </Link>
      </div>
    </div>
  );
}
