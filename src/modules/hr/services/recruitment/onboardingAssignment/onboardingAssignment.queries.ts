// src/services/hr/recruitment/onboardingAssignment/onboardingAssignment.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingAssignmentApi } from '@/modules/hr/services/recruitment/onboardingAssignment/onboardingAssignment.api';
import { onboardingAssignmentKeys } from '@/modules/hr/services/recruitment/onboardingAssignment/onboardingAssignment.key';
import type {
    OnboardingAssignmentListDto,
    OnboardingAssignmentAddDto,
    OnboardingAssignmentModDto
} from '@/modules/hr/types/recruit/onboardingAssignment';

// ============= QUERIES =============

export const useOnboardingAssignments = (filters?: { employeeId?: string; taskId?: string }) => {
    return useQuery<OnboardingAssignmentListDto[], Error>({
        queryKey: onboardingAssignmentKeys.list(filters),
        queryFn: () => {
            if (filters?.employeeId) {
                return onboardingAssignmentApi.getByEmployee(filters.employeeId);
            }
            if (filters?.taskId) {
                return onboardingAssignmentApi.getByTask(filters.taskId);
            }
            return onboardingAssignmentApi.getAll();
        },
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

export const useOnboardingAssignment = (id: string | undefined) => {
    return useQuery<OnboardingAssignmentListDto, Error>({
        queryKey: onboardingAssignmentKeys.detail(id!),
        queryFn: () => onboardingAssignmentApi.getById(id!),
        enabled: !!id,
    });
};

// ============= MUTATIONS =============

export const useCreateOnboardingAssignment = (options?: {
    onSuccess?: (data: OnboardingAssignmentListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OnboardingAssignmentListDto, Error, OnboardingAssignmentAddDto>({
        mutationFn: onboardingAssignmentApi.create,
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.lists() });
            options?.onSuccess?.(newItem);
        },
        onError: options?.onError,
    });
};

export const useUpdateOnboardingAssignment = (options?: {
    onSuccess?: (data: OnboardingAssignmentListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OnboardingAssignmentListDto, Error, OnboardingAssignmentModDto>({
        mutationFn: onboardingAssignmentApi.update,
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.detail(updatedItem.id) });
            options?.onSuccess?.(updatedItem);
        },
        onError: options?.onError,
    });
};

export const useDeleteOnboardingAssignment = (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: onboardingAssignmentApi.delete,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.detail(id) });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

export const useUpdateOnboardingAssignmentStatus = (options?: {
    onSuccess?: (data: OnboardingAssignmentListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OnboardingAssignmentListDto, Error, { id: string; status: string }>({
        mutationFn: ({ id, status }) => onboardingAssignmentApi.updateStatus(id, status),
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: onboardingAssignmentKeys.detail(updatedItem.id) });
            options?.onSuccess?.(updatedItem);
        },
        onError: options?.onError,
    });
};