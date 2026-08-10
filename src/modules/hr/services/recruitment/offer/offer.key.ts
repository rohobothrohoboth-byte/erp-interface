// src/services/hr/recruitment/offer/offer.key.ts

export const offerKeys = {
    all: ['offers'] as const,
    lists: () => [...offerKeys.all, 'list'] as const,
    list: (filter?: { applicantId?: string; jobPostingId?: string }) =>
        [...offerKeys.lists(), { filter }] as const,
    details: () => [...offerKeys.all, 'detail'] as const,
    detail: (id: string) => [...offerKeys.details(), id] as const,
    byApplicant: (applicantId: string) => [...offerKeys.all, 'applicant', applicantId] as const,
    byJobPosting: (jobPostingId: string) => [...offerKeys.all, 'jobPosting', jobPostingId] as const,
} as const;