import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jpEvalFlowApi } from './jpEvalFlow.api';
import { jpEvalFlowKeys } from './jpEvalFlow.key';
import type { JpEvalFlowListDto, JpEvalFlowAddDto, JpEvalFlowModDto } from '../../../../types/hr/recruit/jpEvalFlow';

export const useJpEvalFlows = (postId: string) =>
  useQuery<JpEvalFlowListDto[], Error>({
    queryKey: jpEvalFlowKeys.byPost(postId),
    queryFn: () => jpEvalFlowApi.getByPost(postId),
    enabled: !!postId,
    staleTime: 0,
  });

export const useCreateJpEvalFlow = (options?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation<void, Error, JpEvalFlowAddDto>({
    mutationFn: jpEvalFlowApi.create,
    onSuccess: (_, vars) => {
      qc.refetchQueries({ queryKey: jpEvalFlowKeys.byPost(vars.jobPostingId) });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useUpdateJpEvalFlow = (postId: string, options?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation<void, Error, JpEvalFlowModDto>({
    mutationFn: jpEvalFlowApi.update,
    onSuccess: () => {
      qc.refetchQueries({ queryKey: jpEvalFlowKeys.byPost(postId) });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useDeleteJpEvalFlow = (postId: string, options?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: jpEvalFlowApi.delete,
    onSuccess: () => {
      qc.refetchQueries({ queryKey: jpEvalFlowKeys.byPost(postId) });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};
