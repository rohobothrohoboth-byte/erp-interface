// src/services/hr/recruitment/jobPosting/jobPosting.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostingApi } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.api';
import { jobPostingKeys } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.key';
import type {
    JobPostingListDto,
    JobPostingAddDto,
    JobPostingModDto,
    JobPostingViewDto
} from '@/modules/hr/types/recruit/jobPosting';

// ============= QUERIES =============

export const useJobPostings = () => {
    return useQuery<JobPostingListDto[], Error>({
        queryKey: jobPostingKeys.lists(),
        queryFn: () => jobPostingApi.getAll(),
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

export const useJobPostingDetail = (id: string) => {
    return useQuery<JobPostingViewDto, Error>({ // ✅ Changed to JobPostingViewDto
        queryKey: jobPostingKeys.detail(id),
        queryFn: () => jobPostingApi.getById(id),
        enabled: !!id,
        staleTime: 0,
    });
};

export const useJobPostingsByWfp = (wfpId: string) => {
    return useQuery<JobPostingListDto[], Error>({
        queryKey: jobPostingKeys.byWfp(wfpId),
        queryFn: () => jobPostingApi.getByWfp(wfpId),
        enabled: !!wfpId,
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

// ============= MUTATIONS =============

export const useCreateJobPosting = (options?: {
    onSuccess?: () => void;
    onError?: (e: Error) => void
}) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, JobPostingAddDto>({
        mutationFn: jobPostingApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobPostingKeys.lists() });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

export const useCreateAllJobPosting = (options?: {
    onSuccess?: () => void;
    onError?: (e: Error) => void
}) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, JobPostingAddDto>({
        mutationFn: jobPostingApi.createAll,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobPostingKeys.lists() });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

export const useUpdateJobPosting = (options?: {
    onSuccess?: () => void;
    onError?: (e: Error) => void
}) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, JobPostingModDto>({
        mutationFn: jobPostingApi.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobPostingKeys.lists() });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

export const useDeleteJobPosting = (options?: {
    onSuccess?: () => void;
    onError?: (e: Error) => void
}) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: jobPostingApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobPostingKeys.lists() });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};