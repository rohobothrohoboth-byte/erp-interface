// src/services/hr/recruitment/interview/interview.key.ts

export const interviewKeys = {
    all: ['interviews'] as const,
    lists: () => [...interviewKeys.all, 'list'] as const,
    list: (filter?: { applicantId?: string; jobPostingId?: string }) =>
        [...interviewKeys.lists(), { filter }] as const,
    details: () => [...interviewKeys.all, 'detail'] as const,
    detail: (id: string) => [...interviewKeys.details(), id] as const,
    byApplicant: (applicantId: string) => [...interviewKeys.all, 'applicant', applicantId] as const,
    byJobPosting: (jobPostingId: string) => [...interviewKeys.all, 'jobPosting', jobPostingId] as const,
} as const;