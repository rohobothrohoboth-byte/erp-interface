import api from '@/shared/services/api';

export type BackupItem = { id: string; name: string; sizeBytes: number; createdAt: string; status: string };
type BackupList = { items: BackupItem[]; total: number; retentionDays: number };

const baseUrl = `${import.meta.env.VITE_CORE_MODULE_URL || 'core/module/v1'}/Backup`;
export const backupApi = {
  list: async () => (await api.get<BackupList>(`${baseUrl}/List`)).data,
  create: async () => (await api.post<BackupItem>(`${baseUrl}/Create`)).data,
  upload: async (file: File) => {
    const form = new FormData(); form.append('file', file);
    return (await api.post<BackupItem>(`${baseUrl}/Upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  restore: async (name: string) => (await api.post(`${baseUrl}/Restore/${encodeURIComponent(name)}?confirm=true`)).data,
  remove: async (name: string) => (await api.delete(`${baseUrl}/${encodeURIComponent(name)}`)).data,
};
