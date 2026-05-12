import { api } from '../../api';
import type { NameListItem } from '../../../types/NameList/nameList';

const baseUrl = `${import.meta.env.VITE_HRMM_PROFILE_URL || '/hrm/profile/v1'}/Names`;

export const hrmProfileApi = {
  getAllAddressNames: async (): Promise<NameListItem[]> => {
    const response = await api.get(`${baseUrl}/AllAddressName`);
    return response.data;
  },
};
