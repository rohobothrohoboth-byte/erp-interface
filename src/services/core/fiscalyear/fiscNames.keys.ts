export const fiscNamesKeys = {
  all: ['fiscalYearNames'] as const,
  active: () => [...fiscNamesKeys.all, 'active'] as const,
} as const;
