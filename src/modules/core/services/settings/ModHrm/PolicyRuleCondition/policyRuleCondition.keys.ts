import type { UUID } from "@/modules/core/types/Settings/PolicyRuleCondtion";

export const policyRuleConditionKeys = {
  all: ["policy-rule-condition"] as const,

  lists: () => [...policyRuleConditionKeys.all, "list"] as const,
  list: (ruleId: UUID) => [...policyRuleConditionKeys.lists(), ruleId] as const,

  details: () => [...policyRuleConditionKeys.all, "detail"] as const,
  detail: (id: UUID) => [...policyRuleConditionKeys.details(), id] as const,
};