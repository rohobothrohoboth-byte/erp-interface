import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import { evaluationTypeFetcher } from '@/modules/hr/services/recruitment/evaluationType/evaluationType.api';
import { evaluationTypeKeys } from '@/modules/hr/services/recruitment/evaluationType/evaluationType.key';

import type {
  EvaluationTypeListDto,
  EvaluationTypeAddDto,
  EvaluationTypeModDto,
  UUID,
} from '@/modules/hr/types/recruit/evaluationType';

// ====================== QUERY HOOKS ======================
export const useEvaluationTypes = (
  filters?: { search?: string },
  options?: Omit<UseQueryOptions<EvaluationTypeListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<EvaluationTypeListDto[], Error>({
    queryKey: evaluationTypeKeys.list(filters),
    queryFn: () => evaluationTypeFetcher.getAllEvaluationTypes(),       
    refetchOnMount: true,
    ...options,
  });
};

// ====================== MUTATION HOOKS ======================
export const useCreateEvaluationType = (
  options?: Omit<UseMutationOptions<EvaluationTypeListDto, Error, EvaluationTypeAddDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluationTypeFetcher.createEvaluationType,
    ...options, 
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ 
        queryKey: evaluationTypeKeys.lists() 
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, mutation);
      }
    },
  });
};

export const useUpdateEvaluationType = (
  options?: Omit<UseMutationOptions<EvaluationTypeListDto, Error, EvaluationTypeModDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluationTypeFetcher.updateEvaluationType,
    ...options, 
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: evaluationTypeKeys.lists() });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, mutation);
      }
    },
  });
};

export const useDeleteEvaluationType = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluationTypeFetcher.deleteEvaluationType,
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: evaluationTypeKeys.lists() });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, mutation);
      }
    },
  });
};