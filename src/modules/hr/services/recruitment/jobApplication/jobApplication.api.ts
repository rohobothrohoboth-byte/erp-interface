import axios from 'axios';
import { getAccessToken } from '@/modules/auth/utils/auth.utils';
import { useAuthStore } from '@/shared/stores/auth.store';
import { api } from '@/shared/services/api';

// Multipart uploads use raw axios (so the browser sets the multipart boundary), but we
// reuse the shared client's gateway base URL so requests always route through the gateway.
const GATEWAY = (api.defaults.baseURL as string) || import.meta.env.VITE_GATEWAY_URL || '';
const BASE = `${GATEWAY}${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/JobApp`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';

  
};

const getAuth = () => {
  const state = useAuthStore.getState();
  return {
    token: state.token,
    empId: state.employeeId || ''
  };
};

// Raw axios — no interceptors that touch FormData
const rawPost = async (url: string, formData: FormData) => {
    const { token } = getAuth();
  return axios.post(url, formData, {
    withCredentials: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // no Content-Type — let browser set multipart boundary
    },
  });
};

const rawPut = async (url: string, formData: FormData) => {
    const { token } = getAuth();
  return axios.put(url, formData, {
    withCredentials: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export const jobApplicationApi = {
  create: async (data: { jobPostingId: string; coverLetter: string; file?: File | null }): Promise<void> => {
    try {
       const { empId } = getAuth();
      console.log('[JobApp] EmployeeId from Zustand Store:', empId);
      const formData = new FormData();
      formData.append('EmployeeId', empId);
      formData.append('JobPostingId', data.jobPostingId);
      formData.append('CoverLetter', data.coverLetter);
      if (data.file) formData.append('File', data.file);
      await rawPost(`${BASE}/InternalApp`, formData);
    } catch (e) { throw new Error(extractError(e)); }
  },

  update: async (data: { id: string; coverLetter: string; rowVersion: string; file?: File | null }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('Id', data.id);
      formData.append('CoverLetter', data.coverLetter);
      formData.append('RowVersion', data.rowVersion);
      if (data.file) formData.append('File', data.file);
      await rawPut(`${BASE}/InternalMod/${data.id}`, formData);
    } catch (e) { throw new Error(extractError(e)); }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = getAccessToken();
      await axios.delete(`${BASE}/InternalDel/${id}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) { throw new Error(extractError(e)); }
  },
};
