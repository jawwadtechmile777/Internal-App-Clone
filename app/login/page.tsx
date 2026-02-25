"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { getDepartmentName, canAccessExecutiveDashboard } from "@/lib/roleGuard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, loading: authLoading, signIn, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;
    if (canAccessExecutiveDashboard(user)) {
      router.replace("/dashboard/executive");
    } else {
      const dept = getDepartmentName(user);
      if (dept === "Finance") router.replace("/dashboard/finance");
      else if (dept === "Verification") router.replace("/dashboard/verification");
      else if (dept === "Operations") router.replace("/dashboard/operations");
      else if (dept === "Support") router.replace("/dashboard/support");
      else router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-700 bg-slate-800 p-6 shadow-xl">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-100">Internal App</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-sm text-red-300">
              {error.message}
            </div>
          )}
          <Button type="submit" className="w-full" loading={submitting}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
