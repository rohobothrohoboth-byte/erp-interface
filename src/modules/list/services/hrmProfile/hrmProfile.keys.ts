export const hrmProfileKeys = {
  all: ['hrmProfile'] as const,
  addressNames: () => [...hrmProfileKeys.all, 'addressNames'] as const,
} as const;
