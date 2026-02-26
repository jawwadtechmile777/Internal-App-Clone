"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { canAccessPath, getDefaultDashboardHref } from "@/lib/roleGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects dashboard routes: redirects to login if unauthenticated,
 * and to the user's own dashboard if they try to access another department's routes.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (pathname && pathname.startsWith("/dashboard") && !canAccessPath(user, pathname)) {
      window.location.href = getDefaultDashboardHref(user);
    }
  }, [user, loading, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
