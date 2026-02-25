import type { Department } from "./department";

export type UserRole = "staff" | "admin" | "executive";

export interface AppUser {
  id: string;
  entity_id: string | null;
  department_id: string;
  role: UserRole;
  status: string;
  created_at: string;
  department?: Department | null;
}

export interface AuthUserProfile extends AppUser {
  department: Department | null;
}
