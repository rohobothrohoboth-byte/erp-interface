import type {
  WorkforcePlanListDto,
  WorkforcePlanAddDto,
  WorkforcePlanModDto,
} from '../../../../types/hr/recruit/workforcePlan';
import type { ReviewDto } from '../../../../types/hr/recruit/reviewDto';
import { api } from '../../../api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/WorkforcePlan`;
const REVIEW_BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/Review`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

export const workforcePlanApi = {
  getAll: async (): Promise<WorkforcePlanListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllWorkforcePlan`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getById: async (id: string): Promise<WorkforcePlanListDto> => {
    try {
      const res = await api.get(`${BASE}/GetWorkforcePlan/${id}`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  create: async (data: WorkforcePlanAddDto): Promise<WorkforcePlanListDto> => {
    try {
      const res = await api.post(`${BASE}/AddWorkforcePlan`, data);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  update: async (data: WorkforcePlanModDto): Promise<WorkforcePlanListDto> => {
    try {
      const res = await api.put(`${BASE}/ModWorkforcePlan/${data.id}`, data);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelWorkforcePlan/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // POST /Review/WoFoPl — body: ReviewDto { id, reviewById, appCount, status (numeric string), comment }
  review: async (data: ReviewDto): Promise<void> => {
    try {
      await api.post(`${REVIEW_BASE}/WoFoPl`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },
};
