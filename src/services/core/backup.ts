import api from '@/shared/services/api';

export type BackupItem = { id: string; name: string; sizeBytes: number; createdAt: string; status: string };

type BackupList = { items: BackupItem[]; total: number; retentionDays: number };

export const backupApi = {
  list: async () => (await api.get<BackupList>('/api/core/module/v1/Backup/List')).data,
  create: async () => (await api.post<BackupItem>('/api/core/module/v1/Backup/Create')).data,
  upload: async (file: File) => {
    const form = new FormData(); form.append('file', file);
    return (await api.post<BackupItem>('/api/core/module/v1/Backup/Upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  restore: async (name: string) => (await api.post(`/api/core/module/v1/Backup/Restore/${encodeURIComponent(name)}?confirm=true`)).data,
  remove: async (name: string) => (await api.delete(`/api/core/module/v1/Backup/${encodeURIComponent(name)}`)).data,
  downloadUrl: (name: string) => `${api.defaults.baseURL}/api/core/module/v1/Backup/Download/${encodeURIComponent(name)}`,
};
