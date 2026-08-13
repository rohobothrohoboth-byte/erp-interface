// src/services/hr/recruitment/jobPostEval/jobPostEval.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostEvalApi, type JpAppEvalDto } from '@/modules/hr/services/recruitment/jobPostEval/jobPostEval.api';
import { jobPostingKeys } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.key';

// ============================================
// QUERY KEYS
// ============================================

export const evalKeys = {
  all: ['evaluation'] as const,
  status: (jobAppId: string) => [...evalKeys.all, 'status', jobAppId] as const,
  progress: (jobAppId: string) => [...evalKeys.all, 'progress', jobAppId] as const,
};

// ============================================
// QUERIES
// ============================================

// Evaluation progress (current step + score history) for a job application.
export function useEvaluationStatus(jobAppId: string) {
  return useQuery({
    queryKey: evalKeys.status(jobAppId),
    queryFn: () => (jobAppId ? jobPostEvalApi.getEvaluationStatus(jobAppId) : Promise.resolve(null)),
    enabled: !!jobAppId,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

// ============================================
// MUTATIONS
// ============================================

// Start evaluation for a whole job posting (bulk).
export function useStartEvaluation(options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: jobPostEvalApi.startEvaluation,
    onSuccess: (_, jobPostingId) => {
      qc.invalidateQueries({ queryKey: jobPostingKeys.lists() });
      qc.invalidateQueries({ queryKey: [...jobPostingKeys.lists(), 'detail', jobPostingId] });
      qc.invalidateQueries({ queryKey: evalKeys.all });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

// Score the current step for a single job application.
export function useEvaluateApplicant(options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation<void, Error, JpAppEvalDto>({
    mutationFn: jobPostEvalApi.evaluateApplicant,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: evalKeys.status(vars.id) });
      qc.invalidateQueries({ queryKey: evalKeys.all });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
