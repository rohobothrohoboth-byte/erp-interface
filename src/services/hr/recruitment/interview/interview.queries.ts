// src/services/hr/recruitment/interview/interview.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewApi } from './interview.api';
import type { CreateInterviewRequest } from './interview.api';

export const interviewKeys = {
    all: ['interviews'] as const,
    lists: () => [...interviewKeys.all, 'list'] as const,
    list: (filter: string) => [...interviewKeys.lists(), { filter }] as const,
    details: () => [...interviewKeys.all, 'detail'] as const,
    detail: (id: string) => [...interviewKeys.details(), id] as const,
    byApplicant: (applicantId: string) => [...interviewKeys.all, 'byApplicant', applicantId] as const,
    byJobPosting: (jobPostingId: string) => [...interviewKeys.all, 'byJobPosting', jobPostingId] as const,
};

// ✅ Query: Get interviews (all or filtered)
export function useInterviews({ applicantId, jobPostingId }: { applicantId?: string; jobPostingId?: string } = {}) {
    const queryKey = applicantId
        ? interviewKeys.byApplicant(applicantId)
        : jobPostingId
            ? interviewKeys.byJobPosting(jobPostingId)
            : interviewKeys.lists();

    const queryFn = async () => {
        if (applicantId) {
            return await interviewApi.getInterviewsByApplicant(applicantId);
        } else if (jobPostingId) {
            return await interviewApi.getInterviewsByJobPosting(jobPostingId);
        }
        return await interviewApi.getAllInterviews();
    };

    return useQuery({
        queryKey,
        queryFn,
        enabled: true,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

// ✅ Query: Get interview by ID
export function useInterview(id: string | undefined) {
    return useQuery({
        queryKey: interviewKeys.detail(id || ''),
        queryFn: () => interviewApi.getInterview(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

// ✅ Query: Get interview detail (alias)
export function useInterviewDetail(id: string | undefined) {
    return useInterview(id);
}

// ✅ Mutation: Create interview
export function useCreateInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInterviewRequest) => {
            console.log('Creating interview with data:', data);
            return interviewApi.createInterview(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: interviewKeys.byApplicant(variables.applicantId),
            });
            if (variables.jobPostingId) {
                queryClient.invalidateQueries({
                    queryKey: interviewKeys.byJobPosting(variables.jobPostingId),
                });
            }
            queryClient.invalidateQueries({
                queryKey: interviewKeys.lists(),
            });
        },
        onError: (error) => {
            console.error('Error creating interview:', error);
        },
    });
}

// ✅ Mutation: Update interview
export function useUpdateInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => {
            return interviewApi.updateInterview(id, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: interviewKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: interviewKeys.lists(),
            });
        },
    });
}

// ✅ Mutation: Delete interview
export function useDeleteInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            return interviewApi.deleteInterview(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: interviewKeys.lists(),
            });
        },
    });
}

// ✅ Mutation: Cancel interview
export function useCancelInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            return interviewApi.cancelInterview(id);
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: interviewKeys.detail(id),
            });
            queryClient.invalidateQueries({
                queryKey: interviewKeys.lists(),
            });
        },
    });
}

// ✅ Mutation: Reschedule interview
export function useRescheduleInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => {
            return interviewApi.rescheduleInterview(id, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: interviewKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: interviewKeys.lists(),
            });
        },
    });
}

// ✅ Mutation: Complete interview
export function useCompleteInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, feedback, score }: { id: string; feedback?: string; score?: number }) => {
            return interviewApi.completeInterview(id, feedback, score);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: interviewKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: interviewKeys.lists(),
            });
        },
    });
}