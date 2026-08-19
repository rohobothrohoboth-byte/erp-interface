import { api } from "@/shared/services/api";

const BASE = `${import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1'}/JobPublish`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

export const jobPublishApi = {
  // POST /PublishJobPosting — body: { id, comment }
  publish: async (data: { id: string; comment: string | null }): Promise<void> => {
    try {
      await api.post(`${BASE}/PublishJobPost`, { id: data.id, comment: data.comment });
    } catch (e) { throw new Error(extractError(e)); }
  },

  // POST /PublishAllJobPosting — bulk publish for a plan
  publishAll: async (data: { id: string; comment: string | null }): Promise<void> => {
    try {
      await api.post(`${BASE}/PublishAllJobPost`, { id: data.id, comment: data.comment });
    } catch (e) { throw new Error(extractError(e)); }
  },

  
  // POST /CloseJobPosting/{id}
  close: async (id: string): Promise<void> => {
    try {
      await api.post(`${BASE}/CloseJobPost/${id}`);
    } catch (e) { throw new Error(extractError(e)); }
  },}