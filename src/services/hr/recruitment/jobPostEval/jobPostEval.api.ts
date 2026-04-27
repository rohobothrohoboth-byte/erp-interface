import { api } from '../../../api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobPostEval`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

export interface JpAppEvalDto {
  id: string;
  score: number;
  feedback?: string | null;
}

export const jobPostEvalApi = {
  // GET /JpStartEval/{id}
  startEvaluation: async (jobPostingId: string): Promise<void> => {
    try {
      await api.get(`${BASE}/JpStartEval/${jobPostingId}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // POST /JpAppEvaluate
  evaluateApplicant: async (data: JpAppEvalDto): Promise<void> => {
    try {
      await api.post(`${BASE}/JpAppEvaluate`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },
};
