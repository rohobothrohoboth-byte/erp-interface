// src/services/hr/recruitment/jobPosting/jobPosting.key.ts

export const jobPostingKeys = {
  all: ['jobPostings'] as const,
  lists: () => [...jobPostingKeys.all, 'list'] as const,
  list: (reqId?: string) => [...jobPostingKeys.lists(), { reqId }] as const,
  details: () => [...jobPostingKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobPostingKeys.details(), id] as const,
  byWfp: (wfpId: string) => [...jobPostingKeys.all, 'wfp', wfpId] as const,
} as const;