/**
 * Role-based access control using public.users + departments (role source of truth).
 * All logic delegates to lib/roleConfig.ts; no hardcoded roles here.
 */
import {
  normalizeDepartmentSlug,
  canAccessPath as configCanAccessPath,
  getDefaultDashboardHref as configGetDefaultDashboardHref,
  type DepartmentSlug,
} from "@/lib/roleConfig";
import type { AppUser } from "@/types/user";

/** Resolve department slug from user (public.users + departments join). */
export function getDepartmentSlug(user: AppUser | null): DepartmentSlug | null {
  if (!user) return null;
  const name = user.department?.name ?? null;
  return normalizeDepartmentSlug(name);
}

/** User can access this path (enforced by department). */
export function canAccessPath(user: AppUser | null, path: string): boolean {
  const slug = getDepartmentSlug(user);
  if (!slug) return false;
  return configCanAccessPath(slug, path);
}

/** Redirect target when user has no access (their own dashboard). */
export function getDefaultDashboardHref(user: AppUser | null): string {
  const slug = getDepartmentSlug(user);
  if (!slug) return "/dashboard";
  return configGetDefaultDashboardHref(slug);
}

export type { DepartmentSlug };
