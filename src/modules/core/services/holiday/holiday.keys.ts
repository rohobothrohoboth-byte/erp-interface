import type { UUID } from '@/modules/core/types/holiday';

export const holidayKeys = {
  all: ['holidays'] as const,
  lists: () => [...holidayKeys.all, 'list'] as const,
  list: (filters?: { fiscalYearId?: UUID; isPublic?: boolean }) => 
    [...holidayKeys.lists(), { filters }] as const,
  details: () => [...holidayKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...holidayKeys.details(), id] as const,
} as const;