// src/services/hr/recruitment/workforcePlan/workforcePlan.key.ts

export const workforcePlanKeys = {
  all: ['workforcePlans'] as const,
  lists: () => [...workforcePlanKeys.all, 'list'] as const,
  list: (filters?: { search?: string; status?: string }) =>
      [...workforcePlanKeys.lists(), { filters }] as const,
  details: () => [...workforcePlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...workforcePlanKeys.details(), id] as const,
  stats: () => [...workforcePlanKeys.all, 'stats'] as const,
  requisitions: (planId: string) => [...workforcePlanKeys.all, 'requisitions', planId] as const,
} as const;