// src/services/hr/recruitment/jobPostEval/jobPostEval.api.ts

import { api } from '@/shared/services/api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobPostEval`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  }
  return error.message || 'An unexpected error occurred';
};

export interface JpAppEvalDto {
  id: string;
  score: number;
  feedback?: string | null;
}

// ✅ DTO for starting evaluation
export interface StartEvaluationDto {
  jobAppId: string;
}

// ✅ DTO for evaluation status response
export interface EvaluationStatusDto {
  id: string;
  jobAppId: string;
  currentStepId: string;
  isCompleted: boolean;
  dateAdd: string;
  dateMod: string | null;
  isDeleted: boolean;
}

// ✅ DTO for evaluate step
export interface EvaluateStepDto {
  jobAppId: string;
  stepId: string;
  evaluatorId: string;
  score: number;
  feedback?: string | null;
}

// ✅ DTO for evaluate response
export interface EvaluateStepResponseDto {
  id: string;
  jobAppId: string;
  evaluationStepId: string;
  evaluatorId: string;
  score: number;
  feedback: string;
  isCurrent: boolean;
  isCompleted: boolean;
  nextStepId?: string;
  dateAdd: string;
  dateMod: string | null;
  isDeleted: boolean;
}

export const jobPostEvalApi = {
  // ✅ GET /JpStartEval/{id}
  startEvaluation: async (jobPostingId: string): Promise<void> => {
    try {
      await api.get(`${BASE}/JpStartEval/${jobPostingId}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ POST /JpAppEvaluate
  evaluateApplicant: async (data: JpAppEvalDto): Promise<void> => {
    try {
      await api.post(`${BASE}/JpAppEvaluate`, data);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ GET /GetProgress/{jobAppId}
  getEvaluationStatus: async (jobAppId: string): Promise<EvaluationStatusDto> => {
    try {
      const response = await api.get(`${BASE}/GetProgress/${jobAppId}`);
      return response.data?.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ POST /StartEvaluation
  startEvaluationForApplicant: async (data: StartEvaluationDto): Promise<EvaluationStatusDto> => {
    try {
      const response = await api.post(`${BASE}/StartEvaluation`, data);
      return response.data?.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ POST /JpAppEvaluate (detailed version)
  evaluateStep: async (data: EvaluateStepDto): Promise<EvaluateStepResponseDto> => {
    try {
      const response = await api.post(`${BASE}/JpAppEvaluate`, data);
      return response.data?.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};