import { api } from '../../../api';
import { getAccessToken } from '../../../../utils/auth.utils';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '../../../../types/auth/auth.types';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/JobApp`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

const getEmployeeId = (): string => {
  try {
    const token = getAccessToken();
    if (!token) return '';
    const payload = jwtDecode<JwtPayload>(token);
    return payload.employeeId ?? '';
  } catch { return ''; }
};

export const jobApplicationApi = {
  // POST /InternalApp  multipart/form-data
  create: async (data: { jobPostingId: string; coverLetter: string }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('EmployeeId', getEmployeeId());
      formData.append('JobPostingId', data.jobPostingId);
      formData.append('CoverLetter', data.coverLetter);
      await api.post(`${BASE}/InternalApp`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) { throw new Error(extractError(e)); }
  },

  // PUT /InternalMod/{id}  multipart/form-data
  update: async (data: { id: string; coverLetter: string; rowVersion: string }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('Id', data.id);
      formData.append('CoverLetter', data.coverLetter);
      formData.append('RowVersion', data.rowVersion);
      await api.put(`${BASE}/InternalMod/${data.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (e) { throw new Error(extractError(e)); }
  },

  // DELETE /InternalDel/{id}
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/InternalDel/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },
};
