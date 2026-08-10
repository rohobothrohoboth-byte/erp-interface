import type { UUID } from '@/modules/core/types/comp';

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) =>
    [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...companyKeys.details(), id] as const,
} as const;

