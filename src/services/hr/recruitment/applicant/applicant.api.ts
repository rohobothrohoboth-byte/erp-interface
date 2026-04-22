import { api } from '../../../api';
import type { JobAppListDto, JobAppInfoDto } from '../../../../types/hr/recruit/jopApp';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/Applicant`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || 'An unexpected error occurred';
};

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && raw.id) return [raw];
  return [];
};

export const applicantApi = {
  // POST /AllIntApp — all applicants across all postings
  getAll: async (): Promise<JobAppListDto[]> => {
    try {
      const res = await api.post(`${BASE}/AllIntApp`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // GET /JobPostAllIntApp/{id} — applicants for a specific job posting
  getByPost: async (postId: string): Promise<JobAppListDto[]> => {
    try {
      const res = await api.get(`${BASE}/JobPostAllIntApp/${postId}`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // GET /GetIntApp/{id} — single applicant detail
  getById: async (id: string): Promise<JobAppInfoDto> => {
    try {
      const res = await api.get(`${BASE}/GetIntApp/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },
};
