import type { UUID } from '@/modules/auth/types/MenuPerApi';

export const menuPerApiKeys = {
  all: ['menuPerApis'] as const,
  byUser: (userId: UUID) => [...menuPerApiKeys.all, 'user', userId] as const,
  filtered: (userId: UUID, menuIds: UUID[]) =>
    [...menuPerApiKeys.all, 'filtered', userId, { menuIds }] as const,
  flattened: (userId: UUID, menuIds: UUID[]) =>
    [...menuPerApiKeys.all, 'flattened', userId, { menuIds }] as const,
  availableMenus: (userId: UUID) => [...menuPerApiKeys.all, 'menus', userId] as const,
} as const;
