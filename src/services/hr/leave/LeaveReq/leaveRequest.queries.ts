import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { leaveReqFetcher } from "./leaveRequest.api";
import { leaveReqKeys } from "./leaveRequest.keys";
import type {
  ViewLvReqDto,
  LvRqstAddDto,
  LvRqstModDto,
  UUID,
  LvRqstRevDto,
} from "../../../types/leaverequest";
import { leaveReqPendKeys } from "../LeaveReqPend/leaveReqPend.keys";

export const useLeaveRequest = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<ViewLvReqDto, Error>, "queryKey" | "queryFn">,
) =>
  useQuery<ViewLvReqDto, Error>({
    queryKey: leaveReqKeys.detail(id!),
    queryFn: () => leaveReqFetcher.getLeaveRequestById(id!),
    enabled: !!id,
    retry: false,
    ...options,
  });

export const useAddLeaveRequest = (
  options?: Omit<UseMutationOptions<string, Error, LvRqstAddDto>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, LvRqstAddDto>({
    mutationFn: leaveReqFetcher.addLeaveRequest,

    onSuccess: (message, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: leaveReqPendKeys.all,
      });

      options?.onSuccess?.(message, variables, context, mutation);
    },

    ...options,
  });
};

export const useUpdateLeaveRequest = (
  options?: Omit<UseMutationOptions<string, Error, LvRqstModDto>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, LvRqstModDto>({
    mutationFn: leaveReqFetcher.updateLeaveRequest,

    onSuccess: (message, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: leaveReqKeys.detail(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: leaveReqPendKeys.all,
      });

      options?.onSuccess?.(message, variables, context, mutation);
    },

    ...options,
  });
};

export const useDeleteLeaveRequest = (
  options?: Omit<UseMutationOptions<string, Error, UUID>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, UUID>({
    mutationFn: leaveReqFetcher.deleteLeaveRequest,

    onSuccess: (message, id, context, mutation) => {
      queryClient.removeQueries({
        queryKey: leaveReqKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: leaveReqPendKeys.all,
      });

      options?.onSuccess?.(message, id, context, mutation);
    },

    ...options,
  });
};

export const useReviewLeaveRequest = (
  options?: Omit<UseMutationOptions<string, Error, LvRqstRevDto>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, LvRqstRevDto>({
    mutationFn: leaveReqFetcher.reviewLeaveRequest,

    onSuccess: (message, variables, context, mutation) => {
      // Refresh the request details
      queryClient.invalidateQueries({
        queryKey: leaveReqKeys.detail(variables.id),
      });

      // Refresh all pending request lists
      queryClient.invalidateQueries({
        queryKey: leaveReqPendKeys.all,
      });

      options?.onSuccess?.(message, variables, context, mutation);
    },

    ...options,
  });
};