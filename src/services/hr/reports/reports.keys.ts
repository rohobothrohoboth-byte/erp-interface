export const reportsKeys = {
  summary: ['hr', 'reports', 'summary'] as const,
  domain: (name: string) => ['hr', 'reports', name] as const,
};
