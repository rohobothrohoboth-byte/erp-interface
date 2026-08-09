import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type {
  GoalCreateDto,
  GoalDto,
  KPIDto,
  PerformanceReviewCreateDto,
  PerformanceReviewDto,
  ReviewDecisionDto,
} from '../../../types/hr/performance';

const BASE = import.meta.env.VITE_HR_PERFORMANCE_URL || '/performance';

export const performanceApi = {
  getGoals: async (employeeId?: string) => {
    try {
      const q = employeeId ? `?employeeId=${employeeId}` : '';
      return unwrapData<GoalDto[]>(await api.get(`${BASE}/goals${q}`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  createGoal: async (data: GoalCreateDto) => {
    try { return unwrapData<GoalDto>(await api.post(`${BASE}/goals`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getKpis: async (employeeId?: string) => {
    try {
      const q = employeeId ? `?employeeId=${employeeId}` : '';
      return unwrapData<KPIDto[]>(await api.get(`${BASE}/kpis${q}`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  getReviews: async (employeeId?: string) => {
    try {
      const q = employeeId ? `?employeeId=${employeeId}` : '';
      return unwrapData<PerformanceReviewDto[]>(await api.get(`${BASE}/reviews${q}`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  createReview: async (data: PerformanceReviewCreateDto) => {
    try { return unwrapData<PerformanceReviewDto>(await api.post(`${BASE}/reviews`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  submitReview: async (id: string) => {
    try { return unwrapData<PerformanceReviewDto>(await api.post(`${BASE}/reviews/${id}/submit`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  approveReview: async (id: string, data: ReviewDecisionDto) => {
    try { return unwrapData<PerformanceReviewDto>(await api.post(`${BASE}/reviews/${id}/approve`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  rejectReview: async (id: string, data: ReviewDecisionDto) => {
    try { return unwrapData<PerformanceReviewDto>(await api.post(`${BASE}/reviews/${id}/reject`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
};
