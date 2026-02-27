/**
 * Centralized role-based routing and sidebar config.
 * Role is resolved from: public.users.department_id → departments.name
 * Do NOT hardcode roles elsewhere; use this module as single source of truth.
 */

/** Normalized department slug (from departments.name, case-insensitive). */
export type DepartmentSlug =
  | "executive"
  | "support"
  | "finance"
  | "operations"
  | "verification";

/** Known department names as stored in DB (any case). Used only for normalization. */
const DEPARTMENT_NAME_TO_SLUG: Record<string, DepartmentSlug> = {
  executive: "executive",
  support: "support",
  finance: "finance",
  operations: "operations",
  verification: "verification",
};

/**
 * Normalize department name from public.users → departments to a slug.
 * Resolves role from departments table; use this for all access and UI logic.
 */
export function normalizeDepartmentSlug(name: string | null | undefined): DepartmentSlug | null {
  if (!name || typeof name !== "string") return null;
  const key = name.trim().toLowerCase();
  return DEPARTMENT_NAME_TO_SLUG[key] ?? null;
}

/** Path prefixes each department is allowed to access. */
const ALLOWED_PREFIXES: Record<DepartmentSlug, string[]> = {
  executive: ["/dashboard/executive"],
  support: ["/dashboard/support"],
  finance: ["/dashboard/finance"],
  operations: ["/dashboard/operations"],
  verification: ["/dashboard/verification"],
};

export function getAllowedPathPrefixes(slug: DepartmentSlug): string[] {
  return ALLOWED_PREFIXES[slug] ?? [];
}

export function canAccessPath(slug: DepartmentSlug, path: string): boolean {
  const prefixes = getAllowedPathPrefixes(slug);
  return prefixes.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

export function getDefaultDashboardHref(slug: DepartmentSlug): string {
  const prefix = ALLOWED_PREFIXES[slug]?.[0];
  return prefix ?? "/dashboard";
}

/** Sidebar: single link (no dropdown). */
export interface SidebarLink {
  type: "link";
  label: string;
  href: string;
}

/** Sidebar: dropdown with children. */
export interface SidebarDropdown {
  type: "dropdown";
  label: string;
  children: { label: string; href: string }[];
}

export type SidebarItem = SidebarLink | SidebarDropdown;

/** Sidebar config per department. Executive sees all modules; others see Dashboard + own module. */
const SIDEBAR_CONFIG: Record<DepartmentSlug, SidebarItem[]> = {
  executive: [
    { type: "link", label: "Dashboard", href: "/dashboard/executive" },
    {
      type: "dropdown",
      label: "Support",
      children: [{ label: "Overview", href: "/dashboard/executive/support" }],
    },
    {
      type: "dropdown",
      label: "Finance",
      children: [
        { label: "Activities", href: "/dashboard/executive/finance/activities" },
        { label: "Overview", href: "/dashboard/executive/finance" },
      ],
    },
    {
      type: "dropdown",
      label: "Operations",
      children: [{ label: "Overview", href: "/dashboard/executive/operations" }],
    },
    {
      type: "dropdown",
      label: "Verification",
      children: [{ label: "Overview", href: "/dashboard/executive/verification" }],
    },
  ],
  support: [
    { type: "link", label: "Dashboard", href: "/dashboard/support" },
    {
      type: "dropdown",
      label: "Support",
      children: [{ label: "Overview", href: "/dashboard/support" }],
    },
  ],
  finance: [
    { type: "link", label: "Dashboard", href: "/dashboard/finance" },
    {
      type: "dropdown",
      label: "Finance",
      children: [
        { label: "Activities", href: "/dashboard/finance/activities" },
        { label: "Overview", href: "/dashboard/finance" },
      ],
    },
  ],
  operations: [
    { type: "link", label: "Dashboard", href: "/dashboard/operations" },
    {
      type: "dropdown",
      label: "Operations",
      children: [{ label: "Overview", href: "/dashboard/operations" }],
    },
  ],
  verification: [
    { type: "link", label: "Dashboard", href: "/dashboard/verification" },
    {
      type: "dropdown",
      label: "Verification",
      children: [{ label: "Overview", href: "/dashboard/verification" }],
    },
  ],
};

export function getSidebarConfig(slug: DepartmentSlug): SidebarItem[] {
  return SIDEBAR_CONFIG[slug] ?? [];
}

/** Whether this department is executive (super admin). Executive has no entity_id restriction. */
export function isExecutiveSlug(slug: DepartmentSlug): boolean {
  return slug === "executive";
}

/** Whether this department is support (entity-based access). */
export function isSupportSlug(slug: DepartmentSlug): boolean {
  return slug === "support";
}
