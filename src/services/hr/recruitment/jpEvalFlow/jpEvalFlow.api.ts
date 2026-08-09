// src/services/hr/recruitment/jpEvalFlow/jpEvalFlow.api.ts

import { api } from '../../../api';
import type { JpEvalFlowListDto, JpEvalFlowAddDto, JpEvalFlowModDto } from '../../../../types/hr/recruit/jpEvalFlow';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JpEvalFlow`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

const normalizeArray = (raw: any): any[] => {
  // ✅ Handle null/undefined/empty responses
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && raw.id) return [raw];
  return [];
};

export const jpEvalFlowApi = {
  // POST /AllJpEvalFlow/{jobPostingId}
  getByPost: async (postId: string): Promise<JpEvalFlowListDto[]> => {
    try {
      const res = await api.post(`${BASE}/AllJpEvalFlow/${postId}`);
      // ✅ Check if response has data
      const data = res.data?.data ?? res.data ?? [];
      console.log(`📥 JpEvalFlow response for post ${postId}:`, data);
      return normalizeArray(data);
    } catch (e: any) {
      // ✅ Handle 400/500 errors gracefully
      if (e.response?.status === 400 || e.response?.status === 500 || e.response?.status === 404) {
        console.warn(`⚠️ No evaluation flow found for post ${postId}. Returning empty array.`);
        return [];
      }
      throw new Error(extractError(e));
    }
  },

  // GET /GetJpEvalFlow/{id}
  getById: async (id: string): Promise<JpEvalFlowListDto> => {
    try {
      const res = await api.get(`${BASE}/GetJpEvalFlow/${id}`);
      return res.data?.data ?? res.data;
    } catch (e: any) {
      if (e.response?.status === 404) {
        return null as any;
      }
      throw new Error(extractError(e));
    }
  },

  // POST /AddJpEvalFlow
  create: async (data: JpEvalFlowAddDto): Promise<void> => {
    try {
      await api.post(`${BASE}/AddJpEvalFlow`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // PUT /ModJpEvalFlow/{id}
  update: async (data: JpEvalFlowModDto): Promise<void> => {
    try {
      await api.put(`${BASE}/ModJpEvalFlow/${data.id}`, data);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // DELETE /DelJpEvalFlow/{id}
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelJpEvalFlow/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },
};