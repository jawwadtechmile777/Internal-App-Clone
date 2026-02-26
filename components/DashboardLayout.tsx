"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentSlug } from "@/lib/roleGuard";
import { useEntities } from "@/hooks/useEntities";
import { getSidebarConfig, isExecutiveSlug, isSupportSlug, type SidebarItem } from "@/lib/roleConfig";
import { Button } from "@/components/ui/Button";

const linkBase =
  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-inset ";
const linkActive = "bg-slate-700 text-gray-100";
const linkInactive = "text-gray-300 hover:bg-slate-700/60 hover:text-gray-100";

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 15L12 9L18 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarLinkItem({
  item,
  pathname,
}: {
  item: Extract<SidebarItem, { type: "link" }>;
  pathname: string | null;
}) {
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
  return (
    <Link href={item.href} className={linkBase + (isActive ? linkActive : linkInactive)}>
      {item.label}
    </Link>
  );
}

function SidebarDropdownItem({
  item,
  pathname,
}: {
  item: Extract<SidebarItem, { type: "dropdown" }>;
  pathname: string | null;
}) {
  const isDropdownActive = item.children.some(
    (c) => pathname === c.href || (c.href !== "/dashboard" && pathname?.startsWith(c.href))
  );

  const [open, setOpen] = useState(isDropdownActive);
  useEffect(() => {
    if (isDropdownActive) setOpen(true);
  }, [isDropdownActive]);

  const expanded = open || isDropdownActive;
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        className={linkBase + linkInactive + " w-full text-left flex items-center justify-between"}
      >
        <span>{item.label}</span>
        <span className="text-gray-500">{expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
      </button>
      {expanded ? (
        <div className="ml-3 space-y-0.5 border-l border-gray-700 pl-2">
          {item.children.map((child) => {
            const isChildActive =
              pathname === child.href || (child.href !== "/dashboard" && pathname?.startsWith(child.href));
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`block rounded px-2 py-1.5 text-sm ${isChildActive ? "bg-slate-700/80 text-gray-100" : "text-gray-400 hover:bg-slate-700/50 hover:text-gray-200"}`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SidebarNavItem({ item, pathname }: { item: SidebarItem; pathname: string | null }) {
  return item.type === "link" ? (
    <SidebarLinkItem item={item} pathname={pathname} />
  ) : (
    <SidebarDropdownItem item={item} pathname={pathname} />
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const slug = getDepartmentSlug(user ?? null);
  const sidebarItems = slug ? getSidebarConfig(slug) : [];
  const adminLabel = user?.department?.name ? `Admin: ${user.department.name}` : "Admin: —";

  const supportEntityBase =
    slug && isExecutiveSlug(slug)
      ? "/dashboard/executive/support"
      : "/dashboard/support";

  const entities = useEntities({
    enabled: !!slug && (isExecutiveSlug(slug) || (isSupportSlug(slug) && !!user?.entity_id)),
    restrictedEntityId: slug && isSupportSlug(slug) ? user?.entity_id ?? null : null,
  });

  const sidebarItemsWithEntities: SidebarItem[] = sidebarItems.map((item) => {
    if (item.type !== "dropdown" || item.label !== "Support") return item;
    const children =
      slug && isSupportSlug(slug) && !user?.entity_id
        ? [{ label: "No entity assigned", href: supportEntityBase }]
        :
      entities.loading && entities.data.length === 0
        ? [{ label: "Loading…", href: supportEntityBase }]
        : entities.data.map((e) => ({
            label: e.name,
            href: `${supportEntityBase}/${e.id}`,
          }));
    return { ...item, children };
  });

  return (
    <div className="flex min-h-screen bg-slate-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-700 bg-slate-800/80">
        <div className="border-b border-gray-700 px-4 py-3">
          <div className="font-semibold text-gray-100">Internal App</div>
          <div className="mt-0.5 text-xs text-gray-400">{adminLabel}</div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {sidebarItemsWithEntities.map((item) => (
            <SidebarNavItem key={item.type === "link" ? item.href : item.label} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={async () => {
              await signOut();
            }}
          >
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
