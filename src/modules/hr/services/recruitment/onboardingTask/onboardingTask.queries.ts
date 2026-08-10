// src/services/hr/recruitment/onboardingTask/onboardingTask.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingTaskApi } from '@/modules/hr/services/recruitment/onboardingTask/onboardingTask.api';
import { onboardingTaskKeys } from '@/modules/hr/services/recruitment/onboardingTask/onboardingTask.key';
import type {
    OnboardingTaskListDto,
    OnboardingTaskAddDto,
    OnboardingTaskModDto
} from '@/modules/hr/types/recruit/onboardingTask';

// ============= QUERIES =============

export const useOnboardingTasks = (planId?: string) => {
    return useQuery<OnboardingTaskListDto[], Error>({
        queryKey: onboardingTaskKeys.list(planId),
        queryFn: () => planId
            ? onboardingTaskApi.getByPlan(planId)
            : onboardingTaskApi.getAll(),
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

export const useOnboardingTask = (id: string | undefined) => {
    return useQuery<OnboardingTaskListDto, Error>({
        queryKey: onboardingTaskKeys.detail(id!),
        queryFn: () => onboardingTaskApi.getById(id!),
        enabled: !!id,
    });
};

// ============= MUTATIONS =============

export const useCreateOnboardingTask = (options?: {
    onSuccess?: (data: OnboardingTaskListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OnboardingTaskListDto, Error, OnboardingTaskAddDto>({
        mutationFn: onboardingTaskApi.create,
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.lists() });
            options?.onSuccess?.(newItem);
        },
        onError: options?.onError,
    });
};

export const useUpdateOnboardingTask = (options?: {
    onSuccess?: (data: OnboardingTaskListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OnboardingTaskListDto, Error, OnboardingTaskModDto>({
        mutationFn: onboardingTaskApi.update,
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.detail(updatedItem.id) });
            options?.onSuccess?.(updatedItem);
        },
        onError: options?.onError,
    });
};

export const useDeleteOnboardingTask = (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: onboardingTaskApi.delete,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.detail(id) });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

// ✅ ADD THIS - Update task status mutation
export const useUpdateOnboardingTaskStatus = (options?: {
    onSuccess?: (data: OnboardingTaskListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OnboardingTaskListDto, Error, { id: string; status: string }>({
        mutationFn: ({ id, status }) => onboardingTaskApi.updateStatus(id, status),
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: onboardingTaskKeys.detail(updatedItem.id) });
            options?.onSuccess?.(updatedItem);
        },
        onError: options?.onError,
    });
};