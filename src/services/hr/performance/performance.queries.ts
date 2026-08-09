import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from './performance.api';
import { performanceKeys } from './performance.keys';
import type { GoalCreateDto, PerformanceReviewCreateDto, ReviewDecisionDto } from '../../../types/hr/performance';

export const useGoals = () =>
  useQuery({ queryKey: performanceKeys.goals, queryFn: () => performanceApi.getGoals(), staleTime: 0, refetchOnMount: 'always' });

export const useReviews = () =>
  useQuery({ queryKey: performanceKeys.reviews, queryFn: () => performanceApi.getReviews(), staleTime: 0, refetchOnMount: 'always' });

export const useCreateGoal = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: GoalCreateDto) => performanceApi.createGoal(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: performanceKeys.goals }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useCreateReview = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: PerformanceReviewCreateDto) => performanceApi.createReview(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: performanceKeys.reviews }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useReviewAction = (
  action: 'submit' | 'approve' | 'reject',
  opts?: { onSuccess?: () => void; onError?: (e: Error) => void },
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision?: ReviewDecisionDto }) => {
      if (action === 'submit') return performanceApi.submitReview(id);
      if (action === 'approve') return performanceApi.approveReview(id, decision || {});
      return performanceApi.rejectReview(id, decision || {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: performanceKeys.reviews }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};
