// src/services/hr/recruitment/jobRequisition/jobRequisition.api.ts

import type {
  JobReqListDto,
  JobReqAddDto,
  JobReqModDto,
} from '@/modules/hr/types/recruit/jobRequisition';
import type { ReviewDto } from '@/modules/hr/types/recruit/reviewDto';
import { api } from '@/shared/services/api';

const BASE = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/JobReq`;
const REVIEW_BASE = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/Review`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  }
  return error.message || 'An unexpected error occurred';
};

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && raw.id) return [raw];
  return [];
};

export const jobRequisitionApi = {
  // ✅ GET all job requisitions
  getAll: async (): Promise<JobReqListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllJobReq`);
      console.log('📥 All Requisitions Response:', res.data);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) {
      console.error('❌ Error fetching all requisitions:', e);
      throw new Error(extractError(e));
    }
  },

  // GET job requisition by ID
  getById: async (id: string): Promise<JobReqListDto> => {
    try {
      const res = await api.get(`${BASE}/GetJobReq/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // ✅ GET requisitions by workforce plan ID
  getAllWfpJobReq: async (id: string): Promise<JobReqListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllWfpJobReq/${id}`);
      console.log(`📥 Requisitions for Workforce Plan ${id}:`, res.data);
      const raw = res.data?.data ?? res.data ?? [];
      return Array.isArray(raw) ? raw : [raw];
    } catch (e) {
      console.error(`❌ Error fetching requisitions for plan ${id}:`, e);
      throw new Error(extractError(e));
    }
  },

  // POST create requisition
  create: async (data: JobReqAddDto): Promise<JobReqListDto> => {
    try {
      const res = await api.post(`${BASE}/AddJobReq`, data);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // PUT update requisition
  update: async (data: JobReqModDto): Promise<JobReqListDto> => {
    try {
      const res = await api.put(`${BASE}/ModJobReq/${data.id}`, data);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // DELETE requisition
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelJobReq/${id}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  // POST review requisition
  review: async (data: ReviewDto): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/JobReq`, data);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};