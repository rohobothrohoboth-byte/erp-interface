import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workforcePlanApi } from './workforcePlan.api';
import { workforcePlanKeys } from './workforcePlan.key';
import type { WorkforcePlanListDto, WorkforcePlanAddDto, WorkforcePlanModDto } from '../../../../types/hr/recruit/workforcePlan';
import type { ReviewDto } from '../../../../types/hr/recruit/reviewDto';

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

export const useCreateWorkforcePlan = (options?: {
  onSuccess?: (data: WorkforcePlanListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<WorkforcePlanListDto, Error, WorkforcePlanAddDto>({
    mutationFn: workforcePlanApi.create,
    onSuccess: (newItem) => {
      queryClient.setQueriesData<WorkforcePlanListDto[]>(
        { queryKey: workforcePlanKeys.lists() },
        (old) => (old ? [...old, newItem] : [newItem])
      );
      queryClient.refetchQueries({ queryKey: workforcePlanKeys.lists() });
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
      queryClient.setQueriesData<WorkforcePlanListDto[]>(
        { queryKey: workforcePlanKeys.lists() },
        (old) => old?.map((item) => item.id === updatedItem.id ? updatedItem : item)
      );
      queryClient.refetchQueries({ queryKey: workforcePlanKeys.lists() });
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
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData<WorkforcePlanListDto[]>(
        { queryKey: workforcePlanKeys.lists() },
        (old) => old?.filter((item) => item.id !== deletedId)
      );
      queryClient.refetchQueries({ queryKey: workforcePlanKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useReviewWorkforcePlan = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ReviewDto>({
    mutationFn: workforcePlanApi.review,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: workforcePlanKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};
