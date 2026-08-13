import type {
  EvaluationStepListDto,
  EvaluationStepAddDto,
  EvaluationStepModDto,
} from '@/modules/hr/types/recruit/evaluationStep';
import { api } from '@/shared/services/api';

const BASE = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/EvalStep`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  }
  return error.message || 'An unexpected error occurred';
};

export const evaluationStepApi = {
  getAll: async (): Promise<EvaluationStepListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllEvalStep`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getAllByFlow: async (flowId: string): Promise<EvaluationStepListDto[]> => {
    try {
      const res = await api.get(`${BASE}/EvalFlowAllStep/${flowId}`);
      const raw = res.data?.data ?? res.data ?? [];
      // API may return a single object or an array — normalize to array
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object' && raw.id) return [raw];
      return [];
    } catch (e) { throw new Error(extractError(e)); }
  },

  getById: async (id: string): Promise<EvaluationStepListDto> => {
    try {
      const res = await api.get(`${BASE}/GetEvalStep/${id}`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  create: async (data: EvaluationStepAddDto): Promise<EvaluationStepListDto> => {
    try {
      const res = await api.post(`${BASE}/AddEvalStep`, data);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  update: async (data: EvaluationStepModDto): Promise<EvaluationStepListDto> => {
    try {
      const res = await api.put(`${BASE}/ModEvalStep/${data.id}`, data);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelEvalStep/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // Status toggle: POST body { id, rowVersion, stat }
  updateStatus: async (id: string, rowVersion: string, stat: boolean): Promise<EvaluationStepListDto> => {
    try {
      const res = await api.post(`${BASE}/StatEvalStep`, { id, rowVersion, stat });
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },
};
