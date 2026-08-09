// services/List/auth/authList.api.ts

import { api } from '../../api';
import type { NameListItem, RoleListItem } from '../../../types/NameList/nameList';

const permissionUrl = `${import.meta.env.VITE_AUTH_URL || '/auth/v1'}/Permission`;

export const authListApi = {
  getAllModuleNames: async (): Promise<NameListItem[]> => {
    // Changed from /Names/AllModuleName to /Permission/AllModuleName
    const response = await api.get(`${permissionUrl}/AllModuleName`);
    return response.data?.data || response.data || [];
  },

  getAllRoles: async (): Promise<RoleListItem[]> => {
    const response = await api.get(`${permissionUrl}/AllRole`);
    return response.data?.data || response.data || [];
  },

  // Add this if needed
  getAllModuleNameList: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${permissionUrl}/AllModuleName`);
    return response.data?.data || response.data || [];
  },
};