// src/services/hr/recruitment/workforcePlan/workforcePlan.api.ts

import { api } from '../../../api';
import type {
  WorkforcePlanListDto,
  WorkforcePlanAddDto,
  WorkforcePlanModDto,
  WorkforcePlanStatsDto
} from '../../../../types/hr/recruit/workforcePlan';
import type { ReviewDto } from '../../../../types/hr/recruit/reviewDto';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/WorkforcePlan`;
const REVIEW_BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/Review`;

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

export const workforcePlanApi = {
  getAll: async (): Promise<WorkforcePlanListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllWorkforcePlan`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },

  getById: async (id: string): Promise<WorkforcePlanListDto> => {
    try {
      const res = await api.get(`${BASE}/GetWorkforcePlan/${id}`);
      return res.data?.data ?? res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getStats: async (): Promise<WorkforcePlanStatsDto> => {
    try {
      const res = await api.get(`${BASE}/Stats`);
      return res.data?.data ?? res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  create: async (data: WorkforcePlanAddDto): Promise<WorkforcePlanListDto> => {
    try {
      const res = await api.post(`${BASE}/AddWorkforcePlan`, data);
      return res.data?.data ?? res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  update: async (data: WorkforcePlanModDto): Promise<WorkforcePlanListDto> => {
    try {
      const res = await api.put(`${BASE}/ModWorkforcePlan/${data.id}`, data);
      return res.data?.data ?? res.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelWorkforcePlan/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  submitForReview: async (id: string): Promise<void> => {
    try {
      await api.post(`${BASE}/Submit/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  approve: async (id: string, comment?: string): Promise<void> => {
    try {
      await api.post(`${BASE}/Approve/${id}`, { comment });
    } catch (e) { throw new Error(extractError(e)); }
  },

  reject: async (id: string, comment: string): Promise<void> => {
    try {
      await api.post(`${BASE}/Reject/${id}`, { comment });
    } catch (e) { throw new Error(extractError(e)); }
  },

  // ✅ ADD THIS - Review endpoint
  review: async (data: ReviewDto): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/WoFoPl`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },

  getRequisitions: async (planId: string): Promise<any[]> => {
    try {
      const res = await api.get(`${BASE}/${planId}/Requisitions`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },
};