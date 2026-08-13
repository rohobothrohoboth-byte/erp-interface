// src/services/hr/recruitment/workforcePlan/workforcePlan.api.ts

import { api } from '@/shared/services/api';
import type {
  WorkforcePlanListDto,
  WorkforcePlanAddDto,
  WorkforcePlanModDto,
  WorkforcePlanStatsDto
} from '@/modules/hr/types/recruit/workforcePlan';
import type { ReviewDto } from '@/modules/hr/types/recruit/reviewDto';

const BASE = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/WorkforcePlan`;
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

  // Workforce plans are created directly as Pending; there is no separate "submit"
  // step on the backend, so this is a no-op (kept for API compatibility).
  submitForReview: async (_id: string): Promise<void> => {
    return;
  },

  // Approve/reject go through the single Review/WoFoPl endpoint. `appCount` is the
  // number of approved positions (defaults to the plan's total on approve, 0 on reject).
  // Backend ReviewDto.status expects ReviewStat enum keys: "0"=Approve, "1"=Modify, "2"=Reject.
  approve: async (vars: { id: string; comment?: string; appCount?: number }): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/WoFoPl`, {
        id: vars.id,
        status: '0',
        comment: vars.comment ?? '',
        appCount: vars.appCount ?? 0,
      });
    } catch (e) { throw new Error(extractError(e)); }
  },

  reject: async (vars: { id: string; comment: string; appCount?: number }): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/WoFoPl`, {
        id: vars.id,
        status: '2',
        comment: vars.comment ?? '',
        appCount: 0,
      });
    } catch (e) { throw new Error(extractError(e)); }
  },

  // ✅ ADD THIS - Review endpoint
  review: async (data: ReviewDto): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/WoFoPl`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // Requisitions for a plan live under the JobReq controller.
  getRequisitions: async (planId: string): Promise<any[]> => {
    try {
      const jobReqBase = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/JobReq`;
      const res = await api.get(`${jobReqBase}/AllWfpJobReq/${planId}`);
      return normalizeArray(res.data?.data ?? res.data ?? []);
    } catch (e) { throw new Error(extractError(e)); }
  },
};