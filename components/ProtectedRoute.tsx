"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { canAccessPath, getDefaultDashboardHref } from "@/lib/roleGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects dashboard routes: redirects to login if unauthenticated,
 * and to the user's own dashboard if they try to access another department's routes.
 *
 * Uses a grace period before treating a null user as "logged out" to avoid
 * unmounting children during brief auth transitions (e.g. Supabase token refresh).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const wasAuthenticated = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (user) wasAuthenticated.current = true;

  useEffect(() => {
    if (loading) return;

    if (!user && wasAuthenticated.current) {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
      redirectTimer.current = setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      return;
    }

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }

    if (pathname && pathname.startsWith("/dashboard") && !canAccessPath(user, pathname)) {
      window.location.href = getDefaultDashboardHref(user);
    }
  }, [user, loading, pathname]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  if (loading && !wasAuthenticated.current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user && !wasAuthenticated.current) {
    return null;
  }

  return <>{children}</>;
}
