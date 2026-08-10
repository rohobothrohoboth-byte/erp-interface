import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationFlowApi } from '@/modules/hr/services/recruitment/evaluationFlow/evaluationFlow.api';
import { evaluationFlowKeys } from '@/modules/hr/services/recruitment/evaluationFlow/evaluationFlow.key';
import type { EvaluationFlowListDto, EvaluationFlowAddDto, EvaluationFlowModDto } from '@/modules/hr/types/recruit/evaluationFlow';

export const useEvaluationFlows = (filters?: { search?: string }) => {
  return useQuery<EvaluationFlowListDto[], Error>({
    queryKey: evaluationFlowKeys.list(filters),
    queryFn: () => evaluationFlowApi.getAll(),
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useEvaluationFlow = (id: string | undefined) => {
  return useQuery<EvaluationFlowListDto, Error>({
    queryKey: evaluationFlowKeys.detail(id!),
    queryFn: () => evaluationFlowApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateEvaluationFlow = (options?: {
  onSuccess?: (data: EvaluationFlowListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<EvaluationFlowListDto, Error, EvaluationFlowAddDto>({
    mutationFn: evaluationFlowApi.create,
    onSuccess: (newItem) => {
      queryClient.setQueriesData<EvaluationFlowListDto[]>(
        { queryKey: evaluationFlowKeys.lists() },
        (old) => (old ? [...old, newItem] : [newItem])
      );
      queryClient.refetchQueries({ queryKey: evaluationFlowKeys.lists() });
      options?.onSuccess?.(newItem);
    },
    onError: options?.onError,
  });
};

export const useUpdateEvaluationFlow = (options?: {
  onSuccess?: (data: EvaluationFlowListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<EvaluationFlowListDto, Error, EvaluationFlowModDto>({
    mutationFn: evaluationFlowApi.update,
    onSuccess: (updatedItem) => {
      queryClient.setQueriesData<EvaluationFlowListDto[]>(
        { queryKey: evaluationFlowKeys.lists() },
        (old) => old?.map((item) => item.id === updatedItem.id ? updatedItem : item)
      );
      queryClient.refetchQueries({ queryKey: evaluationFlowKeys.lists() });
      options?.onSuccess?.(updatedItem);
    },
    onError: options?.onError,
  });
};

export const useDeleteEvaluationFlow = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: evaluationFlowApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData<EvaluationFlowListDto[]>(
        { queryKey: evaluationFlowKeys.lists() },
        (old) => old?.filter((item) => item.id !== deletedId)
      );
      queryClient.refetchQueries({ queryKey: evaluationFlowKeys.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useToggleEvaluationFlowStatus = (options?: {
  onSuccess?: (data: EvaluationFlowListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<EvaluationFlowListDto, Error, { id: string; rowVersion: string; stat: boolean }>({
    mutationFn: ({ id, rowVersion, stat }) => evaluationFlowApi.updateStatus(id, rowVersion, stat),
    onSuccess: (updatedItem) => {
      queryClient.setQueriesData<EvaluationFlowListDto[]>(
        { queryKey: evaluationFlowKeys.lists() },
        (old) => old?.map((item) => item.id === updatedItem.id ? updatedItem : item)
      );
      queryClient.refetchQueries({ queryKey: evaluationFlowKeys.lists() });
      options?.onSuccess?.(updatedItem);
    },
    onError: options?.onError,
  });
};
