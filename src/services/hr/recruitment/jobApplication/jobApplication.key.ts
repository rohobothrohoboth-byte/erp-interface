export const jobApplicationKeys = {
  all: ['jobApplications'] as const,
  lists: () => [...jobApplicationKeys.all, 'list'] as const,
} as const;
