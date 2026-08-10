import type { UUID } from '@/modules/core/types/dept';

export const deptKeys = {
  all: ['departments'] as const,
  lists: () => [...deptKeys.all, 'list'] as const,
  list: (filters?: { search?: string; branchId?: UUID }) => 
    [...deptKeys.lists(), { filters }] as const,
  details: () => [...deptKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...deptKeys.details(), id] as const,
  branchDepartments: (branchId: UUID) => 
    [...deptKeys.all, 'branch-departments', branchId] as const,
} as const;