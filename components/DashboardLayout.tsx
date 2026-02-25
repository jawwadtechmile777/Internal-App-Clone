"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentName, canAccessExecutiveDashboard } from "@/lib/roleGuard";
import { Button } from "@/components/ui/Button";

interface NavItem {
  href: string;
  label: string;
  allowed: boolean;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const dept = user ? getDepartmentName(user) : null;

  const navItems: NavItem[] = user
    ? [
        { href: "/dashboard/finance", label: "Finance", allowed: dept === "Finance" || canAccessExecutiveDashboard(user) },
        { href: "/dashboard/verification", label: "Verification", allowed: dept === "Verification" || canAccessExecutiveDashboard(user) },
        { href: "/dashboard/operations", label: "Operations", allowed: dept === "Operations" || canAccessExecutiveDashboard(user) },
        { href: "/dashboard/support", label: "Support", allowed: dept === "Support" || canAccessExecutiveDashboard(user) },
        { href: "/dashboard/executive", label: "Executive", allowed: canAccessExecutiveDashboard(user) },
      ].filter((item) => item.allowed)
    : [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <span className="font-semibold text-slate-800">Internal App</span>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname?.startsWith(item.href)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-xs text-slate-500">{user?.department?.name ?? "—"}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
