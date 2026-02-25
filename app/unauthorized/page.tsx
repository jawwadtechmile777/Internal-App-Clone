import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4">
      <h1 className="text-2xl font-semibold text-gray-100">Unauthorized</h1>
      <p className="mt-2 text-gray-400">You do not have access to this page.</p>
      <Link
        href="/login"
        className="mt-6 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        Back to login
      </Link>
    </div>
  );
}
