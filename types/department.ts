export interface Department {
  id: string;
  name: string;
}

export type DepartmentName = "Support" | "Finance" | "Verification" | "Operations" | "Executive";

export const DEPARTMENT_NAMES: DepartmentName[] = [
  "Support",
  "Finance",
  "Verification",
  "Operations",
  "Executive",
];
