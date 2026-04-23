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
    refetchOnMount: 'always',
  });

export const useCreateJpEvalFlow = (options?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation<void, Error, JpEvalFlowAddDto>({
    mutationFn: jpEvalFlowApi.create,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: jpEvalFlowKeys.byPost(vars.jobPostingId), refetchType: 'all' });
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
      qc.invalidateQueries({ queryKey: jpEvalFlowKeys.byPost(postId), refetchType: 'all' });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useDeleteJpEvalFlow = (postId: string, options?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => jpEvalFlowApi.delete(id),
     onSuccess: (_, deletedId) => {
      qc.setQueryData<JpEvalFlowListDto[]>(
        jpEvalFlowKeys.byPost(postId),
        (old) => old?.filter(item => item.id !== deletedId) ?? []
      );

      options?.onSuccess?.();
    },

    onError: options?.onError,
  });
};
