import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostingApi } from './jobPosting.api';
import { jobPostingKeys } from './jobPosting.key';
import type { JobPostingListDto, JobPostingAddDto, JobPostingModDto } from '../../../../types/hr/recruit/jobPosting';

export const useJobPostings = () => {
  return useQuery<JobPostingListDto[], Error>({
    queryKey: jobPostingKeys.lists(),
    queryFn: () => jobPostingApi.getAll(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useCreateJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, JobPostingAddDto>({
    mutationFn: jobPostingApi.create,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobPostingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useCreateAllJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, JobPostingAddDto>({
    mutationFn: jobPostingApi.createAll,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobPostingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useUpdateJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, JobPostingModDto>({
    mutationFn: jobPostingApi.update,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobPostingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useDeleteJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: jobPostingApi.delete,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobPostingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const usePublishJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; comment: string | null }>({
    mutationFn: jobPostingApi.publish,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobPostingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useCloseJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: jobPostingApi.close,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobPostingKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};
