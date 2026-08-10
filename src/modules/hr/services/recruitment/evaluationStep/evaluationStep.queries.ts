import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationStepApi } from '@/modules/hr/services/recruitment/evaluationStep/evaluationStep.api';
import { evaluationStepKeys } from '@/modules/hr/services/recruitment/evaluationStep/evaluationStep.key';
import type { EvaluationStepListDto, EvaluationStepAddDto, EvaluationStepModDto } from '@/modules/hr/types/recruit/evaluationStep';

export const useEvaluationSteps = (flowId: string) => {
  return useQuery<EvaluationStepListDto[], Error>({
    queryKey: evaluationStepKeys.byFlow(flowId),
    queryFn: () => evaluationStepApi.getAllByFlow(flowId),
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: !!flowId,
  });
};

export const useEvaluationStep = (id: string | undefined) => {
  return useQuery<EvaluationStepListDto, Error>({
    queryKey: evaluationStepKeys.detail(id!),
    queryFn: () => evaluationStepApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateEvaluationStep = (options?: {
  onSuccess?: (data: EvaluationStepListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<EvaluationStepListDto, Error, EvaluationStepAddDto>({
    mutationFn: evaluationStepApi.create,
    onSuccess: (newItem) => {
      // Invalidate all step queries so the active byFlow query refetches
      queryClient.invalidateQueries({ queryKey: evaluationStepKeys.all });
      options?.onSuccess?.(newItem);
    },
    onError: options?.onError,
  });
};

export const useUpdateEvaluationStep = (options?: {
  onSuccess?: (data: EvaluationStepListDto) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<EvaluationStepListDto, Error, EvaluationStepModDto>({
    mutationFn: evaluationStepApi.update,
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: evaluationStepKeys.all });
      options?.onSuccess?.(updatedItem);
    },
    onError: options?.onError,
  });
};

export const useDeleteEvaluationStep = (flowId: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: evaluationStepApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationStepKeys.all });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};
