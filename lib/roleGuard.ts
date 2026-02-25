import type { DepartmentName } from "@/types/department";
import type { AppUser } from "@/types/user";

export type AllowedRole = DepartmentName | "admin" | "executive";

const DEPARTMENT_NAME_BY_ID = new Map<string, string>();

export function setDepartmentNameById(id: string, name: string): void {
  DEPARTMENT_NAME_BY_ID.set(id, name);
}

export function getDepartmentNameById(id: string): string | undefined {
  return DEPARTMENT_NAME_BY_ID.get(id);
}

export function getDepartmentName(user: AppUser): DepartmentName | null {
  const name = user.department?.name ?? getDepartmentNameById(user.department_id);
  if (!name) return null;
  const allowed: DepartmentName[] = ["Support", "Finance", "Verification", "Operations", "Executive"];
  return allowed.includes(name as DepartmentName) ? (name as DepartmentName) : null;
}

export function isExecutive(user: AppUser): boolean {
  const dept = getDepartmentName(user);
  return dept === "Executive" || user.role === "executive";
}

export function isAdmin(user: AppUser): boolean {
  return user.role === "admin" || isExecutive(user);
}

export function canAccessFinanceDashboard(user: AppUser): boolean {
  const dept = getDepartmentName(user);
  return dept === "Finance" || isExecutive(user);
}

export function canAccessVerificationDashboard(user: AppUser): boolean {
  const dept = getDepartmentName(user);
  return dept === "Verification" || isExecutive(user);
}

export function canAccessOperationsDashboard(user: AppUser): boolean {
  const dept = getDepartmentName(user);
  return dept === "Operations" || isExecutive(user);
}

export function canAccessSupportDashboard(user: AppUser): boolean {
  const dept = getDepartmentName(user);
  return dept === "Support" || isExecutive(user);
}

export function canAccessExecutiveDashboard(user: AppUser): boolean {
  return isExecutive(user);
}

export function canAccessDashboardPath(
  user: AppUser,
  path: string
): boolean {
  if (path.startsWith("/dashboard/executive")) return canAccessExecutiveDashboard(user);
  if (path.startsWith("/dashboard/finance")) return canAccessFinanceDashboard(user);
  if (path.startsWith("/dashboard/verification")) return canAccessVerificationDashboard(user);
  if (path.startsWith("/dashboard/operations")) return canAccessOperationsDashboard(user);
  if (path.startsWith("/dashboard/support")) return canAccessSupportDashboard(user);
  return false;
}
