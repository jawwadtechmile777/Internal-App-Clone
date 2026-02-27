import type { RechargeOperationsStatus, RechargeVerificationStatus } from "@/types/recharge";

/** Allowed operations_status transitions. Only these are valid. */
const ALLOWED_OPERATIONS_TRANSITIONS: Record<
  RechargeOperationsStatus,
  RechargeOperationsStatus[]
> = {
  pending: ["processing", "waiting_operations", "waiting_verification"],
  waiting_verification: ["waiting_operations"],
  waiting_operations: ["completed", "rejected"],
  processing: ["completed", "rejected"],
  completed: [],
  rejected: [],
  cancelled: [],
};

/** Allowed verification_status transitions. */
const ALLOWED_VERIFICATION_TRANSITIONS: Record<
  RechargeVerificationStatus,
  RechargeVerificationStatus[]
> = {
  not_required: [],
  pending: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

export function canTransitionOperationsStatus(
  from: RechargeOperationsStatus | null,
  to: RechargeOperationsStatus
): boolean {
  if (from === null) return to === "pending" || to === "waiting_verification" || to === "waiting_operations";
  const allowed = ALLOWED_OPERATIONS_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

export function canTransitionVerificationStatus(
  from: RechargeVerificationStatus,
  to: RechargeVerificationStatus
): boolean {
  const allowed = ALLOWED_VERIFICATION_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

export function getAllowedNextOperationsStatus(
  current: RechargeOperationsStatus | null
): RechargeOperationsStatus[] {
  if (current === null) return ["pending", "waiting_verification", "waiting_operations"];
  return ALLOWED_OPERATIONS_TRANSITIONS[current] ?? [];
}

export function getAllowedNextVerificationStatus(
  current: RechargeVerificationStatus
): RechargeVerificationStatus[] {
  return ALLOWED_VERIFICATION_TRANSITIONS[current] ?? [];
}
