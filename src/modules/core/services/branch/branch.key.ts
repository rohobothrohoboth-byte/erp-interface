import type { UUID } from "@/modules/core/types/branch";

export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (filters?: { companyId?: UUID; search?: string }) => 
    [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: UUID) => [...branchKeys.details(), id] as const,
  companyList: () => [...branchKeys.all, "company-list"] as const,
  companyBranches: (companyId: UUID) => 
    [...branchKeys.all, "company-branches", companyId] as const,
} as const;