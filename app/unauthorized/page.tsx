import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-2xl font-semibold text-slate-800">Unauthorized</h1>
      <p className="mt-2 text-slate-600">You do not have access to this page.</p>
      <Link
        href="/login"
        className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Back to login
      </Link>
    </div>
  );
}
