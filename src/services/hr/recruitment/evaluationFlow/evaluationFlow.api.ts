import type {
  EvaluationFlowListDto,
  EvaluationFlowAddDto,
  EvaluationFlowModDto,
} from '../../../../types/hr/recruit/evaluationFlow';
import { api } from '../../../api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/EvalFlow`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  }
  return error.message || 'An unexpected error occurred';
};

export const evaluationFlowApi = {
  getAll: async (): Promise<EvaluationFlowListDto[]> => {
    try {
      const res = await api.get(`${BASE}/AllEvalFlow`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  getById: async (id: string): Promise<EvaluationFlowListDto> => {
    try {
      const res = await api.get(`${BASE}/GetEvalFlow/${id}`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  create: async (data: EvaluationFlowAddDto): Promise<EvaluationFlowListDto> => {
    try {
      const res = await api.post(`${BASE}/AddEvalFlow`, data);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  update: async (data: EvaluationFlowModDto): Promise<EvaluationFlowListDto> => {
    try {
      const res = await api.put(`${BASE}/ModEvalFlow/${data.id}`, data);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/DelEvalFlow/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },

  // PATCH status toggle: POST /StatEvalFlow  body: { id, rowVersion, stat }
  updateStatus: async (id: string, rowVersion: string, stat: boolean): Promise<EvaluationFlowListDto> => {
    try {
      const res = await api.post(`${BASE}/StatEvalFlow`, { id, rowVersion, stat });
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },
};
