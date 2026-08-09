import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type { JobOfferAddDto, JobOfferHireDto, JobOfferListDto } from '../../../types/hr/jobOffer';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobOffer`;

export const jobOfferApi = {
  getAll: async () => {
    try { return unwrapData<JobOfferListDto[]>(await api.get(`${BASE}/All`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  create: async (data: JobOfferAddDto) => {
    try { return unwrapData<JobOfferListDto>(await api.post(`${BASE}/Add`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  submit: async (id: string) => {
    try { return unwrapData<JobOfferListDto>(await api.post(`${BASE}/Submit/${id}`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  approve: async (data: { id: string; rowVersion?: string; comments?: string }) => {
    try { return unwrapData<JobOfferListDto>(await api.post(`${BASE}/Approve`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  accept: async (data: { id: string; rowVersion?: string }) => {
    try { return unwrapData<JobOfferListDto>(await api.post(`${BASE}/Accept`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  hire: async (data: JobOfferHireDto) => {
    try { return unwrapData<JobOfferListDto>(await api.post(`${BASE}/Hire`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
};
