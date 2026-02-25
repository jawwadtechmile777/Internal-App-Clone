"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentName, canAccessExecutiveDashboard } from "@/lib/roleGuard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    const dept = getDepartmentName(user);
    if (canAccessExecutiveDashboard(user)) {
      router.replace("/dashboard/executive");
    } else if (dept === "Finance") {
      router.replace("/dashboard/finance");
    } else if (dept === "Verification") {
      router.replace("/dashboard/verification");
    } else if (dept === "Operations") {
      router.replace("/dashboard/operations");
    } else if (dept === "Support") {
      router.replace("/dashboard/support");
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
