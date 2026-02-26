"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultDashboardHref, getDepartmentSlug } from "@/lib/roleGuard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    const slug = getDepartmentSlug(user);
    if (slug) {
      router.replace(getDefaultDashboardHref(user));
    } else {
      router.replace("/unauthorized");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
}
