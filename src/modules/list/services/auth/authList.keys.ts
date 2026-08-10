export const authListKeys = {
  all: ['authList'] as const,
  moduleNames: () => [...authListKeys.all, 'moduleNames'] as const,
  roles: () => [...authListKeys.all, 'roles'] as const,
} as const;
