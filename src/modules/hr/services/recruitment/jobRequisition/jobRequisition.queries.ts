// src/services/hr/recruitment/jobRequisition/jobRequisition.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobRequisitionApi } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.api';
import { jobRequisitionKeys } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.key';
import type {
  JobReqListDto,
  JobReqAddDto,
  JobReqModDto
} from '@/modules/hr/types/recruit/jobRequisition';
import type { ReviewDto } from '@/modules/hr/types/recruit/reviewDto';

// ============= QUERIES =============

// ✅ FIX: Get all requisitions (without workforcePlanId filter)
export const useJobRequisitions = (workforcePlanId?: string, filters?: { search?: string; status?: string }) => {
  return useQuery<JobReqListDto[], Error>({
    queryKey: jobRequisitionKeys.list(workforcePlanId, filters),
    queryFn: () => {
      // If workforcePlanId is provided, get by workforce plan
      if (workforcePlanId) {
        return jobRequisitionApi.getAllWfpJobReq(workforcePlanId);
      }
      // Otherwise get all requisitions
      return jobRequisitionApi.getAll();
    },
    enabled: true, // ✅ Always enabled
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useJobRequisition = (id: string | undefined) => {
  return useQuery<JobReqListDto, Error>({
    queryKey: jobRequisitionKeys.detail(id!),
    queryFn: () => jobRequisitionApi.getById(id!),
    enabled: !!id,
  });
};

// ============= MUTATIONS =============

export const useCreateJobRequisition = (options?: {
  onSuccess?: (data: JobReqListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<JobReqListDto, Error, JobReqAddDto>({
    mutationFn: jobRequisitionApi.create,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.lists() });
      options?.onSuccess?.(newItem);
    },
    onError: options?.onError,
  });
};

export const useUpdateJobRequisition = (options?: {
  onSuccess?: (data: JobReqListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<JobReqListDto, Error, JobReqModDto>({
    mutationFn: jobRequisitionApi.update,
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.detail(updatedItem.id) });
      options?.onSuccess?.(updatedItem);
    },
    onError: options?.onError,
  });
};

export const useDeleteJobRequisition = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: jobRequisitionApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.detail(deletedId) });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useReviewJobRequisition = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReviewDto>({
    mutationFn: jobRequisitionApi.review,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};