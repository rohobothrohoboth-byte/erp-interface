export const workforcePlanKeys = {
  all: ['workforcePlans'] as const,
  lists: () => [...workforcePlanKeys.all, 'list'] as const,
  list: (filters?: { search?: string; status?: string }) =>
    [...workforcePlanKeys.lists(), { filters }] as const,
  details: () => [...workforcePlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...workforcePlanKeys.details(), id] as const,
} as const;
