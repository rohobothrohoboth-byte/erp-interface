import { api } from '../../api';
import type { NameListItem, RoleListItem } from '../../../types/NameList/nameList';

const baseUrl = `${import.meta.env.VITE_AUTH_URL || '/auth/v1'}/Names`;
const perUrl = `${import.meta.env.VITE_AUTH_URL || '/auth/v1'}/Permission`;

export const authListApi = {
  getAllModuleNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllModuleName`);
    return response.data;
  },
  getAllRoles: async (): Promise<RoleListItem[]> => {
    const response = await api.get(`${perUrl}/AllRole`);
    return response.data;
  },
};
