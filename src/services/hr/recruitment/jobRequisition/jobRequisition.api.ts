import type {
  JobReqListDto,
  JobReqAddDto,
  JobReqModDto,
} from '../../../../types/hr/recruit/jobRequisition';
import type {  ReviewDto } from '../../../../types/hr/recruit/reviewDto';
import { api } from '../../../api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobReq`;
const REVIEW_BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/Review`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

export const jobRequisitionApi = {
  getAll: async (id: string): Promise<JobReqListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllJobReq/${id}`);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getById: async (id: string): Promise<JobReqListDto> => {
    try {
      const res = await api.get(`${BASE}/GetJobReq/${id}`);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getAllWfpJobReq: async (id: string): Promise<JobReqListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllWfpJobReq/${id}`);
      const raw = res.data?.data ?? res.data ?? [];
      return Array.isArray(raw) ? raw : [raw];
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  create: async (data: JobReqAddDto): Promise<JobReqListDto> => {
    try {
      const res = await api.post(`${BASE}/AddJobReq`, data);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  update: async (data: JobReqModDto): Promise<JobReqListDto> => {
    try {
      const res = await api.put(`${BASE}/ModJobReq/${data.id}`, data);
      return res.data.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelJobReq/${id}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // POST /Review/JobReq  body: ReviewAllDto { id, reviewById, status, comment }
  review: async (data: ReviewDto): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/JobReq`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },
  
};
