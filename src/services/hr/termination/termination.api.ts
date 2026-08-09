import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type {
  EmpOffboardingTaskDto,
  EmpOffboardingTaskUpdateDto,
  EmpTerminationAddDto,
  EmpTerminationDecisionDto,
  EmpTerminationListDto,
} from '../../../types/hr/termination';

const BASE = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/EmpTermination`;

export const terminationApi = {
  getAll: async () => {
    try { return unwrapData<EmpTerminationListDto[]>(await api.get(`${BASE}/All`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getById: async (id: string) => {
    try { return unwrapData<EmpTerminationListDto>(await api.get(`${BASE}/Get/${id}`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  create: async (data: EmpTerminationAddDto) => {
    try { return unwrapData<EmpTerminationListDto>(await api.post(`${BASE}/Add`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  approve: async (data: EmpTerminationDecisionDto) => {
    try { return unwrapData<EmpTerminationListDto>(await api.post(`${BASE}/Approve`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  reject: async (data: EmpTerminationDecisionDto) => {
    try { return unwrapData<EmpTerminationListDto>(await api.post(`${BASE}/Reject`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  apply: async (data: EmpTerminationDecisionDto) => {
    try { return unwrapData<EmpTerminationListDto>(await api.post(`${BASE}/Apply`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  delete: async (id: string) => {
    try { await api.delete(`${BASE}/Del/${id}`); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getOffboarding: async (terminationId: string) => {
    try { return unwrapData<EmpOffboardingTaskDto[]>(await api.get(`${BASE}/Offboarding/${terminationId}`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  updateTask: async (data: EmpOffboardingTaskUpdateDto) => {
    try { return unwrapData<EmpOffboardingTaskDto>(await api.put(`${BASE}/Offboarding/Update`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
};
