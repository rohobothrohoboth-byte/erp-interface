import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type {
  EmpContractAddDto,
  EmpContractListDto,
  EmpContractTerminateDto,
  EmpDecisionDto,
  EmpPromotionAddDto,
  EmpPromotionListDto,
  EmpTransferAddDto,
  EmpTransferListDto,
} from '../../../types/hr/career';

const PROFILE = import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1';

export const contractApi = {
  getAll: async () => {
    try {
      return unwrapData<EmpContractListDto[]>(await api.get(`${PROFILE}/EmpContract/All`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  create: async (data: EmpContractAddDto) => {
    try {
      return unwrapData<EmpContractListDto>(await api.post(`${PROFILE}/EmpContract/Add`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  terminate: async (data: EmpContractTerminateDto) => {
    try {
      return unwrapData<EmpContractListDto>(await api.post(`${PROFILE}/EmpContract/Terminate`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  activate: async (id: string) => {
    try {
      return unwrapData<EmpContractListDto>(await api.post(`${PROFILE}/EmpContract/Activate/${id}`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  delete: async (id: string) => {
    try {
      await api.delete(`${PROFILE}/EmpContract/Del/${id}`);
    } catch (e) { throw new Error(extractApiError(e)); }
  },
};

export const promotionApi = {
  getAll: async () => {
    try {
      return unwrapData<EmpPromotionListDto[]>(await api.get(`${PROFILE}/EmpPromotion/All`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  create: async (data: EmpPromotionAddDto) => {
    try {
      return unwrapData<EmpPromotionListDto>(await api.post(`${PROFILE}/EmpPromotion/Add`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  approve: async (data: EmpDecisionDto) => {
    try {
      return unwrapData<EmpPromotionListDto>(await api.post(`${PROFILE}/EmpPromotion/Approve`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  reject: async (data: EmpDecisionDto) => {
    try {
      return unwrapData<EmpPromotionListDto>(await api.post(`${PROFILE}/EmpPromotion/Reject`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  apply: async (data: EmpDecisionDto) => {
    try {
      return unwrapData<EmpPromotionListDto>(await api.post(`${PROFILE}/EmpPromotion/Apply`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  delete: async (id: string) => {
    try {
      await api.delete(`${PROFILE}/EmpPromotion/Del/${id}`);
    } catch (e) { throw new Error(extractApiError(e)); }
  },
};

export const transferApi = {
  getAll: async () => {
    try {
      return unwrapData<EmpTransferListDto[]>(await api.get(`${PROFILE}/EmpTransfer/All`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  create: async (data: EmpTransferAddDto) => {
    try {
      return unwrapData<EmpTransferListDto>(await api.post(`${PROFILE}/EmpTransfer/Add`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  approve: async (data: EmpDecisionDto) => {
    try {
      return unwrapData<EmpTransferListDto>(await api.post(`${PROFILE}/EmpTransfer/Approve`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  reject: async (data: EmpDecisionDto) => {
    try {
      return unwrapData<EmpTransferListDto>(await api.post(`${PROFILE}/EmpTransfer/Reject`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  apply: async (data: EmpDecisionDto) => {
    try {
      return unwrapData<EmpTransferListDto>(await api.post(`${PROFILE}/EmpTransfer/Apply`, data));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  delete: async (id: string) => {
    try {
      await api.delete(`${PROFILE}/EmpTransfer/Del/${id}`);
    } catch (e) { throw new Error(extractApiError(e)); }
  },
};
