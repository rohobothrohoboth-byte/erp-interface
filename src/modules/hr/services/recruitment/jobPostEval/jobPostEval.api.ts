// src/services/hr/recruitment/jobPostEval/jobPostEval.api.ts

import { api } from '@/shared/services/api';

const BASE = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/JobPostEval`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  }
  return error.message || 'An unexpected error occurred';
};

// Score payload for the current evaluation step.
// `id` MUST be the JobApplication id. The backend picks the current step from
// the application's progress and sets the evaluator from the JWT.
export interface JpAppEvalDto {
  id: string;
  score: number;
  feedback?: string | null;
}

export interface EvalScoreHist {
  stepId: string;
  stepName: string;
  stepOrder: number;
  score: number;
  feedback?: string | null;
}

// Mirrors backend Recruit.Domain.DTOs.JobAppEvalProgressDto.
export interface EvalProgressDto {
  jobAppId: string;
  isStarted: boolean;
  isCompleted: boolean;
  appStatus: string;
  currentStepId: string;
  currentStepName: string;
  currentStepOrder: number;
  minScore: number;
  maxScore: number;
  isFinal: boolean;
  totalSteps: number;
  completedSteps: number;
  scores: EvalScoreHist[];
}

export const jobPostEvalApi = {
  // Start evaluation for an entire job posting (bulk-creates progress for every
  // application on the posting). Requires the posting to be Closed with a flow assigned.
  startEvaluation: async (jobPostingId: string): Promise<void> => {
    try {
      await api.get(`${BASE}/JpStartEval/${jobPostingId}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // Score the current step of a single job application.
  evaluateApplicant: async (data: JpAppEvalDto): Promise<void> => {
    try {
      await api.post(`${BASE}/JpAppEvaluate`, data);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // Read evaluation progress (current step + score history) for a job application.
  getEvaluationStatus: async (jobAppId: string): Promise<EvalProgressDto | null> => {
    try {
      const response = await api.get(`${BASE}/GetProgress/${jobAppId}`);
      return response.data?.data ?? null;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};
