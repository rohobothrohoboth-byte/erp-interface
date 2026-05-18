export const userKeys = {
  all: ['users'] as const,

  detail: (id: string) =>
    [...userKeys.all, 'detail', id] as const,

  profile: () =>
    [...userKeys.all, 'profile'] as const,
};