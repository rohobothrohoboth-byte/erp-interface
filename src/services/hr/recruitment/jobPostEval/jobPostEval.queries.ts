// src/services/hr/recruitment/jobPostEval/jobPostEval.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostEvalApi, type JpAppEvalDto, type StartEvaluationDto, type EvaluateStepDto } from './jobPostEval.api';
import { jobPostingKeys } from '../jobPosting/jobPosting.key';

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



// ============================================
// MUTATIONS
// ============================================

// ✅ Start evaluation for a job posting (triggers the flow)
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

// ✅ Start evaluation for a specific applicant
export function useStartApplicantEvaluation(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartEvaluationDto) => jobPostEvalApi.startEvaluationForApplicant(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: evalKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

// ✅ Evaluate applicant (basic version - single endpoint)
export function useEvaluateApplicant(options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) {
  return useMutation<void, Error, JpAppEvalDto>({
    mutationFn: jobPostEvalApi.evaluateApplicant,
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
// src/services/hr/recruitment/jobPostEval/jobPostEval.queries.ts

// ✅ Fix: Use the correct ID for evaluation status
export function useEvaluationStatus(jobAppId: string) {
  return useQuery({
    queryKey: evalKeys.status(jobAppId),
    queryFn: () => {
      if (!jobAppId) {
        return Promise.resolve(null);
      }
      return jobPostEvalApi.getEvaluationStatus(jobAppId);
    },
    enabled: !!jobAppId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
// ✅ Evaluate step (detailed version with step management)
export function useEvaluateStep(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EvaluateStepDto) => jobPostEvalApi.evaluateStep(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: evalKeys.all });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}