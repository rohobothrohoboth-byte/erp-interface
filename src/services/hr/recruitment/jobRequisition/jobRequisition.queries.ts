import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobRequisitionApi } from './jobRequisition.api';
import { jobRequisitionKeys } from './jobRequisition.key';
import type { JobReqListDto, JobReqAddDto, JobReqModDto, JobReqReviewDto } from '../../../../types/hr/recruit/jobRequisition';
import type { ReviewAllDto } from '../../../../types/hr/recruit/reviewDto';

export const useJobRequisitions = (filters?: { search?: string; status?: string }) => {
  return useQuery<JobReqListDto[], Error>({
    queryKey: jobRequisitionKeys.list(filters),
    queryFn: () => jobRequisitionApi.getAll(),
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

export const useCreateJobRequisition = (options?: {
  onSuccess?: (data: JobReqListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<JobReqListDto, Error, JobReqAddDto>({
    mutationFn: jobRequisitionApi.create,
    onSuccess: (newItem) => {
      queryClient.setQueriesData<JobReqListDto[]>(
        { queryKey: jobRequisitionKeys.lists() },
        (old) => (old ? [...old, newItem] : [newItem])
      );
      queryClient.refetchQueries({ queryKey: jobRequisitionKeys.lists() });
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
      queryClient.setQueriesData<JobReqListDto[]>(
        { queryKey: jobRequisitionKeys.lists() },
        (old) => old?.map((item) => item.id === updatedItem.id ? updatedItem : item)
      );
      queryClient.refetchQueries({ queryKey: jobRequisitionKeys.lists() });
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
      queryClient.setQueriesData<JobReqListDto[]>(
        { queryKey: jobRequisitionKeys.lists() },
        (old) => old?.filter((item) => item.id !== deletedId)
      );
      queryClient.refetchQueries({ queryKey: jobRequisitionKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useReviewJobRequisition = (options?: {
  onSuccess?: (data: JobReqReviewDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<JobReqReviewDto, Error, ReviewAllDto>({
    mutationFn: jobRequisitionApi.review,
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: jobRequisitionKeys.lists() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
