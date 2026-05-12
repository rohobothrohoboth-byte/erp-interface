export const hrListKeys = {
  all: ['hrList'] as const,
  quarters: () => [...hrListKeys.all, 'quarters'] as const,
  educationLevels: () => [...hrListKeys.all, 'educationLevels'] as const,
  relations: () => [...hrListKeys.all, 'relations'] as const,
} as const;
