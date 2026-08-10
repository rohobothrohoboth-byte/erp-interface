// src/services/hr/recruitment/jobPosting/jobPosting.key.ts

export const jobPostingKeys = {
    all: ['jobPostings'] as const,
    lists: () => [...jobPostingKeys.all, 'list'] as const,
    list: (filter: string) => [...jobPostingKeys.lists(), { filter }] as const,
    details: () => [...jobPostingKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobPostingKeys.details(), id] as const,
};