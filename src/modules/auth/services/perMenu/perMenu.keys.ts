import type { UUID } from '@/modules/auth/types/ModPerMenu';

export const perMenuKeys = {
  all: ['perMenus'] as const,
  byUser: (userId: UUID) => [...perMenuKeys.all, 'user', userId] as const,
  filtered: (userId: UUID, moduleIds: UUID[]) =>
    [...perMenuKeys.all, 'filtered', userId, { moduleIds }] as const,
  flattened: (userId: UUID, moduleIds: UUID[]) =>
    [...perMenuKeys.all, 'flattened', userId, { moduleIds }] as const,
  availableModules: (userId: UUID) => [...perMenuKeys.all, 'modules', userId] as const,
} as const;
