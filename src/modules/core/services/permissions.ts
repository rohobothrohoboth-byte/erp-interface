import api from '@/shared/services/api';

export type Role = { id: string; role: string };
export type PermissionModule = { id: string; key: string; name: string; order?: number; menus: PermissionMenu[] };
export type PermissionMenu = { id: string; key: string; label: string; path?: string; icon?: string; isChild?: boolean; order?: number; parentId?: string | null; children: PermissionMenu[]; actions: PermissionAction[] };
export type PermissionAction = { id: string; key: string; name: string };
export type RolePermissions = { roleId: string; roleName: string; modules: string[]; menus: string[]; apis: string[] };

const baseUrl = '/auth/v1/Permission';
const unwrap = <T>(response: any): T => response?.data?.data !== undefined ? response.data.data as T : response.data as T;

export const permissionsApi = {
  getRoles: async () => unwrap<Role[]>(await api.get(`${baseUrl}/AllRole`)),
  getPermissionStructure: async () => unwrap<{ modules: PermissionModule[] }>(await api.get(`${baseUrl}/GetPermissionStructure`)),
  getRolePermissions: async (roleId: string) => unwrap<RolePermissions>(await api.get(`${baseUrl}/GetRolePermissions/${roleId}`)),
  createRole: async (payload: { name: string; description: string }) => unwrap<Role>(await api.post(`${baseUrl}/AddRole`, payload)),
  updateRole: async (id: string, payload: { name: string; description: string }) => unwrap<Role>(await api.put(`${baseUrl}/ModRole/${id}`, { id, ...payload })),
  deleteRole: async (id: string) => unwrap<void>(await api.delete(`${baseUrl}/DelRole/${id}`)),
  saveRolePermissions: async (payload: { roleId: string; moduleIds: string[]; menuIds: string[]; apiActionIds: string[] }) => unwrap<any>(await api.post(`${baseUrl}/SaveRolePermissions`, payload)),
};
