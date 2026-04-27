import type { JobPostingListDto, JobPostingAddDto, JobPostingModDto, JobPostingViewDto } from '../../../../types/hr/recruit/jobPosting';
import { api } from '../../../api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobPosting`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && raw.id) return [raw];
  return [];
};

export const jobPostingApi = {
  getAll: async (): Promise<JobPostingListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllJobPosting`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },

  getById: async (id: string): Promise<JobPostingViewDto> => {
    try {
      const res = await api.get(`${BASE}/GetJobPosting/${id}`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  // POST /AddJobPosting — single requisition
  create: async (data: JobPostingAddDto): Promise<void> => {
    try {
      await api.post(`${BASE}/AddJobPosting`, {
        postType: data.postType,
        deadlineDate: data.deadlineDate,
        id: data.id,
      });
    } catch (e) { throw new Error(extractError(e)); }
  },

  // POST /AddAllJobPosting — bulk (workforce plan ID)
  createAll: async (data: JobPostingAddDto): Promise<void> => {
    try {
      await api.post(`${BASE}/AddAllJobPosting`, {
        postType: data.postType,
        deadlineDate: data.deadlineDate,
        id: data.id,
      });
    } catch (e) { throw new Error(extractError(e)); }
  },

  update: async (data: JobPostingModDto): Promise<void> => {
    try {
      await api.put(`${BASE}/ModJobPosting/${data.id}`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelJobPosting/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // GET /JobPostByWfp/{id} — postings for a workforce plan
  getByWfp: async (wfpId: string): Promise<JobPostingListDto[]> => {
    try {
      const res = await api.get(`${BASE}/JobPostByWfp/${wfpId}`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },

};
