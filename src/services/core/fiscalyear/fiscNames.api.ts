import { api } from '../../api';
import type { NameListItem } from '../../../types/NameList/nameList';

const baseUrl = `${import.meta.env.VITE_HRMM_LEAVE_URL || 'core/module/v1'}/Names`;

export const fiscNamesApi = {
  getActiveFiscalYear: async (): Promise<NameListItem[]> => {
    const res = await api.get(`${baseUrl}/ActiveFiscYear`);
    return res.data;
  },
};
