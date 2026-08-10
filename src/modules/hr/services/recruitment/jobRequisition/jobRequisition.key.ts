// src/services/hr/recruitment/jobRequisition/jobRequisition.key.ts

export const jobRequisitionKeys = {
  all: ["jobRequisitions"] as const,
  lists: () => [...jobRequisitionKeys.all, "list"] as const,
  list: (workforcePlanId?: string, filters?: { search?: string; status?: string }) =>
      [...jobRequisitionKeys.lists(), { workforcePlanId, filters }] as const,
  details: () => [...jobRequisitionKeys.all, "detail"] as const,
  detail: (id: string) => [...jobRequisitionKeys.details(), id] as const,
} as const;