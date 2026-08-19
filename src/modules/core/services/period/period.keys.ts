import type { UUID } from '@/modules/core/types/period';

export const periodKeys = {
  all: ['periods'] as const,
  lists: () => [...periodKeys.all, 'list'] as const,
  list: (filters?: { search?: string; activeOnly?: boolean }) => 
    [...periodKeys.lists(), { filters }] as const,
  details: () => [...periodKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...periodKeys.details(), id] as const,
  activePeriods: () => [...periodKeys.all, 'active'] as const,
} as const;