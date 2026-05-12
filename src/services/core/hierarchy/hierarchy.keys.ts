import type { UUID } from '../../../types/core/hier';

export const hierarchyKeys = {
  all: ['hierarchies'] as const,
  lists: () => [...hierarchyKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) => [...hierarchyKeys.lists(), { filters }] as const,
  details: () => [...hierarchyKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...hierarchyKeys.details(), id] as const,
} as const;
