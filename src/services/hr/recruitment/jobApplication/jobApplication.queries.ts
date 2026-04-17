import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApplicationApi } from './jobApplication.api';
import { jobApplicationKeys } from './jobApplication.key';

export const useCreateJobApplication = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { jobPostingId: string; coverLetter: string }>({
    mutationFn: jobApplicationApi.create,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: jobApplicationKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useUpdateJobApplication = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  return useMutation<void, Error, { id: string; coverLetter: string; rowVersion: string }>({
    mutationFn: jobApplicationApi.update,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useDeleteJobApplication = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  return useMutation<void, Error, string>({
    mutationFn: jobApplicationApi.delete,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
