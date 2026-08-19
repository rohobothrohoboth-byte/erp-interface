// src/services/hr/recruitment/workforcePlan/workforcePlan.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workforcePlanApi } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.api';
import { workforcePlanKeys } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.key';
import type {
  WorkforcePlanListDto,
  WorkforcePlanAddDto,
  WorkforcePlanModDto,
  WorkforcePlanStatsDto
} from '@/modules/hr/types/recruit/workforcePlan';
import type { ReviewDto } from '@/modules/hr/types/recruit/reviewDto';

// ============= QUERIES =============

export const useWorkforcePlans = (filters?: { search?: string; status?: string }) => {
  return useQuery<WorkforcePlanListDto[], Error>({
    queryKey: workforcePlanKeys.list(filters),
    queryFn: () => workforcePlanApi.getAll(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useWorkforcePlan = (id: string | undefined) => {
  return useQuery<WorkforcePlanListDto, Error>({
    queryKey: workforcePlanKeys.detail(id!),
    queryFn: () => workforcePlanApi.getById(id!),
    enabled: !!id,
  });
};

export const useWorkforcePlanStats = () => {
  return useQuery<WorkforcePlanStatsDto, Error>({
    queryKey: workforcePlanKeys.stats(),
    queryFn: () => workforcePlanApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWorkforcePlanRequisitions = (planId: string) => {
  return useQuery<any[], Error>({
    queryKey: workforcePlanKeys.requisitions(planId),
    queryFn: () => workforcePlanApi.getRequisitions(planId),
    enabled: !!planId,
  });
};

// ============= MUTATIONS =============

export const useCreateWorkforcePlan = (options?: {
  onSuccess?: (data: WorkforcePlanListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<WorkforcePlanListDto, Error, WorkforcePlanAddDto>({
    mutationFn: workforcePlanApi.create,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.stats() });
      options?.onSuccess?.(newItem);
    },
    onError: options?.onError,
  });
};

export const useUpdateWorkforcePlan = (options?: {
  onSuccess?: (data: WorkforcePlanListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<WorkforcePlanListDto, Error, WorkforcePlanModDto>({
    mutationFn: workforcePlanApi.update,
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.detail(updatedItem.id) });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.stats() });
      options?.onSuccess?.(updatedItem);
    },
    onError: options?.onError,
  });
};

export const useDeleteWorkforcePlan = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: workforcePlanApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useSubmitWorkforcePlan = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: workforcePlanApi.submitForReview,
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.detail(planId) });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useApproveWorkforcePlan = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; comment?: string; appCount?: number }>({
    mutationFn: workforcePlanApi.approve,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useRejectWorkforcePlan = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; comment: string; appCount?: number }>({
    mutationFn: workforcePlanApi.reject,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

// ✅ ADD THIS - Review mutation that calls the Review/WoFoPl endpoint
export const useReviewWorkforcePlan = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReviewDto>({
    mutationFn: workforcePlanApi.review, // ✅ Make sure this exists in workforcePlan.api.ts
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workforcePlanKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};