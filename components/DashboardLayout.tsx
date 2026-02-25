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
    <div className="flex min-h-screen bg-slate-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-700 bg-slate-800/80">
        <div className="flex h-14 items-center border-b border-gray-700 px-4">
          <span className="font-semibold text-gray-100">Internal App</span>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname?.startsWith(item.href)
                  ? "bg-slate-700 text-gray-100"
                  : "text-gray-300 hover:bg-slate-700/60 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-inset"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <p className="truncate text-xs text-gray-500">{user?.department?.name ?? "—"}</p>
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
