import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobPostEvalApi, type JpAppEvalDto } from './jobPostEval.api';
import { jobPostingKeys } from '../jobPosting/jobPosting.key';

// GET /JpStartEval/{id} — triggers evaluation start for a job posting
export const useStartEvaluation = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: jobPostEvalApi.startEvaluation,
    onSuccess: (_, jobPostingId) => {
      qc.invalidateQueries({ queryKey: jobPostingKeys.lists() });
      qc.invalidateQueries({ queryKey: [...jobPostingKeys.lists(), 'detail', jobPostingId] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

// POST /JpAppEvaluate — score/feedback for a single applicant
export const useEvaluateApplicant = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  return useMutation<void, Error, JpAppEvalDto>({
    mutationFn: jobPostEvalApi.evaluateApplicant,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
