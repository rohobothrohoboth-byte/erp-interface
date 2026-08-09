import { api } from '../../api';
import { extractApiError, unwrapData } from '../apiError';
import type {
  TrainingCertificateDto,
  TrainingEnrollmentCreateDto,
  TrainingEnrollmentDto,
  TrainingEvaluationDto,
  TrainingProgramCreateDto,
  TrainingProgramDto,
  TrainingSessionDto,
} from '../../../types/hr/training';

const BASE = import.meta.env.VITE_HR_TRAINING_URL || '/training';

export const trainingApi = {
  getPrograms: async (status?: string) => {
    try {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      return unwrapData<TrainingProgramDto[]>(await api.get(`${BASE}/programs${q}`));
    } catch (e) { throw new Error(extractApiError(e)); }
  },
  createProgram: async (data: TrainingProgramCreateDto) => {
    try { return unwrapData<TrainingProgramDto>(await api.post(`${BASE}/programs`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  publishProgram: async (id: string) => {
    try { return unwrapData<TrainingProgramDto>(await api.post(`${BASE}/programs/${id}/publish`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getSessions: async () => {
    try { return unwrapData<TrainingSessionDto[]>(await api.get(`${BASE}/sessions`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getEnrollments: async () => {
    try { return unwrapData<TrainingEnrollmentDto[]>(await api.get(`${BASE}/enrollments`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  enroll: async (data: TrainingEnrollmentCreateDto) => {
    try { return unwrapData<TrainingEnrollmentDto>(await api.post(`${BASE}/enrollments`, data)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getEvaluations: async () => {
    try { return unwrapData<TrainingEvaluationDto[]>(await api.get(`${BASE}/evaluations`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  getCertificates: async () => {
    try { return unwrapData<TrainingCertificateDto[]>(await api.get(`${BASE}/certificates`)); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
  issueCertificate: async (enrollmentId: string) => {
    try { return unwrapData<TrainingCertificateDto>(await api.post(`${BASE}/certificates/issue`, { enrollmentId })); }
    catch (e) { throw new Error(extractApiError(e)); }
  },
};
