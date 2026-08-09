export const terminationKeys = {
  all: ['hr', 'terminations'] as const,
  detail: (id: string) => ['hr', 'terminations', id] as const,
  tasks: (id: string) => ['hr', 'terminations', id, 'tasks'] as const,
};
