// src/services/hr/recruitment/applicant/applicant.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicantApi } from './applicant.api';
import type { ApplicantListDto, ApplicantDetailDto } from './applicant.api';

export const applicantKeys = {
    all: ['applicants'] as const,
    lists: () => [...applicantKeys.all, 'list'] as const,
    list: (filter: string) => [...applicantKeys.lists(), { filter }] as const,
    details: () => [...applicantKeys.all, 'detail'] as const,
    detail: (id: string) => [...applicantKeys.details(), id] as const,
    byJobPost: (jobPostingId: string) => [...applicantKeys.all, 'byJobPost', jobPostingId] as const,
};

// Query: Get all applicants
export function useAllApplicants() {
    return useQuery<ApplicantListDto[]>({
        queryKey: applicantKeys.lists(),
        queryFn: () => applicantApi.getAllApplicants(),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

// Query: Get applicant detail
export function useApplicantDetail(id: string | undefined) {
    return useQuery<ApplicantDetailDto>({
        queryKey: applicantKeys.detail(id || ''),
        queryFn: () => applicantApi.getApplicantDetail(id!),
        enabled: !!id,
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });
}

// ✅ Query: Get applicants by job posting
export function useApplicantsByPost(jobPostingId: string | undefined) {
    return useQuery<ApplicantListDto[]>({
        queryKey: applicantKeys.byJobPost(jobPostingId || ''),
        queryFn: () => applicantApi.getApplicantsByJobPosting(jobPostingId!),
        enabled: !!jobPostingId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

// ✅ Query: Get applicant detail with full data for evaluation
export function useApplicantDetailFull(id: string | undefined) {
    return useQuery<ApplicantDetailDto>({
        queryKey: [...applicantKeys.detail(id || ''), 'full'] as const,
        queryFn: () => applicantApi.getApplicantDetail(id!),
        enabled: !!id,
        retry: 1,
        staleTime: 2 * 60 * 1000,
    });
}

// Mutation: Update applicant status
export function useUpdateApplicantStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ applicantId, status, reason }: { applicantId: string; status: string; reason?: string }) =>
            applicantApi.updateApplicantStatus(applicantId, status, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: applicantKeys.detail(variables.applicantId),
            });
            queryClient.invalidateQueries({
                queryKey: applicantKeys.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: applicantKeys.all,
            });
        },
        onError: (error) => {
            console.error('Error updating applicant status:', error);
        },
    });
}