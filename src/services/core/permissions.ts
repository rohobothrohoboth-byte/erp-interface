import api from '@/shared/services/api';

export type Role = { id: string; role: string };
export type PermissionModule = { id: string; key: string; name: string; order?: number; menus: PermissionMenu[] };
export type PermissionMenu = { id: string; key: string; label: string; path?: string; icon?: string; isChild?: boolean; order?: number; parentId?: string | null; children: PermissionMenu[]; actions: PermissionAction[] };
export type PermissionAction = { id: string; key: string; name: string };
export type RolePermissions = { roleId: string; roleName: string; modules: string[]; menus: string[]; apis: string[] };

const unwrap = <T>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  if (response?.data !== undefined) return response.data as T;
  return response as T;
};

export const permissionsApi = {
  getRoles: async () => unwrap<Role[]>((await api.get('/api/auth/v1/Permission/AllRole'))),
  getPermissionStructure: async () => unwrap<{ modules: PermissionModule[] }>(await api.get('/api/auth/v1/Permission/GetPermissionStructure')),
  getRolePermissions: async (roleId: string) => unwrap<RolePermissions>(await api.get(`/api/auth/v1/Permission/GetRolePermissions/${roleId}`)),
  createRole: async (payload: { name: string; description: string }) => unwrap<Role>(await api.post('/api/auth/v1/Permission/AddRole', payload)),
  updateRole: async (id: string, payload: { name: string; description: string }) => unwrap<Role>(await api.put(`/api/auth/v1/Permission/ModRole/${id}`, { id, ...payload })),
  deleteRole: async (id: string) => unwrap<void>(await api.delete(`/api/auth/v1/Permission/DelRole/${id}`)),
  saveRolePermissions: async (payload: { roleId: string; moduleIds: string[]; menuIds: string[]; apiActionIds: string[] }) => unwrap<any>(await api.post('/api/auth/v1/Permission/SaveRolePermissions', payload)),
};
