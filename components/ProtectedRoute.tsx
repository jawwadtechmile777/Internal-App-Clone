"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { canAccessDashboardPath } from "@/lib/roleGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, only Executive can access (dashboard/executive/*). */
  executiveOnly?: boolean;
}

export function ProtectedRoute({ children, executiveOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (executiveOnly) {
      if (!canAccessDashboardPath(user, "/dashboard/executive")) {
        window.location.href = "/unauthorized";
      }
      return;
    }
    if (pathname && pathname.startsWith("/dashboard") && !canAccessDashboardPath(user, pathname)) {
      window.location.href = "/unauthorized";
    }
  }, [user, loading, pathname, executiveOnly]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
