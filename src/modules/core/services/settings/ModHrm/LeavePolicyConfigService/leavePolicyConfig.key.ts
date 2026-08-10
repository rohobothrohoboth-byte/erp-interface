import type { UUID } from "@/modules/core/types/Settings/leavePolicyConfig";

export const leavePolicyConfigKeys = {
  all: ["leave-policy-config"] as const,

  details: () => [...leavePolicyConfigKeys.all, "detail"] as const,
  detail: (id: UUID) => [...leavePolicyConfigKeys.details(), id] as const,

  active: (id: UUID) => [...leavePolicyConfigKeys.all, "active", id] as const,

  list: (id: UUID) => [...leavePolicyConfigKeys.all, "list", id] as const,
};
