import type { UUID } from "@/modules/core/types/Settings/policyAssignmentRule";

export const policyAssignmentRuleKeys = {
  all: ["policy-assignment-rule"] as const,

  lists: () => [...policyAssignmentRuleKeys.all, "list"] as const,
  list: (policyId: UUID) => [...policyAssignmentRuleKeys.lists(), policyId] as const,

  details: () => [...policyAssignmentRuleKeys.all, "detail"] as const,
  detail: (id: UUID) => [...policyAssignmentRuleKeys.details(), id] as const,

  active: (id: UUID) =>
    [...policyAssignmentRuleKeys.all, "active", id] as const,
};