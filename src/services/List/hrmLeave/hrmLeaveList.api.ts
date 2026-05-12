import { api } from '../../api';
import type { ListItem } from '../../../types/List/list';

const namesUrl = `${import.meta.env.VITE_HRMM_LEAVE_URL || 'hrm/leave/v1'}/Names`;

export const hrmLeaveListApi = {
  getAllLeaveTypes: async (): Promise<ListItem[]> => {
    const response = await api.get(`${namesUrl}/AllLeaveTypeName`);
    return response.data;
  },
};
