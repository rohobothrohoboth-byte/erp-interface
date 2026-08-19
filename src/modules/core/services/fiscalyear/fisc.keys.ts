import type { UUID } from '@/modules/core/types/fisc';

export const fiscKeys = {
  all: ['fiscalYears'] as const,
  lists: () => [...fiscKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) => 
    [...fiscKeys.lists(), { filters }] as const,
  details: () => [...fiscKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...fiscKeys.details(), id] as const,
  activeYear: () => [...fiscKeys.all, 'active'] as const,
} as const;