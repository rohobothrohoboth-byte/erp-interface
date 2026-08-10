import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobPublishApi } from "@/modules/hr/services/recruitment/JobPublish/jobPublish.api";
import { jobPostingKeys } from "@/modules/hr/services/recruitment/jobPosting/jobPosting.key";

// ✅ Publish single job
export const usePublishJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; comment: string | null }>({
    mutationFn: jobPublishApi.publish,

    onSuccess: (_, variables) => {
      // refresh job list
      queryClient.invalidateQueries({
        queryKey: jobPostingKeys.lists(),
      });

      // refresh specific job detail
      queryClient.invalidateQueries({
        queryKey: jobPostingKeys.detail(variables.id),
      });

      options?.onSuccess?.();
    },

    onError: options?.onError,
  });
};

// ✅ Publish all jobs
export const usePublishAllJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; comment: string | null }>({
    mutationFn: jobPublishApi.publishAll,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobPostingKeys.all,
      });

      options?.onSuccess?.();
    },

    onError: options?.onError,
  });
};

// ✅ Close job
export const useCloseJobPosting = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: jobPublishApi.close,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobPostingKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: jobPostingKeys.detail(variables),
      });
      options?.onSuccess?.();
    },

    onError: options?.onError,
  });
};