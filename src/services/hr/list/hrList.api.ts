import { api } from '../../api';
import type { ListItem } from '../../../types/List/list';

const baseUrl = `${import.meta.env.VITE_LUP_URL || '/lup/v1'}`;

export const hrListApi = {
  getAllQuarters: async (): Promise<ListItem[]> => {
    const response = await api.get(`${baseUrl}/Quarter`);
    return response.data;
  },
  getAllEducationLevels: async (): Promise<ListItem[]> => {
    const response = await api.get(`${baseUrl}/EducationLevel`);
    return response.data;
  },
  getAllRelations: async (): Promise<ListItem[]> => {
    const response = await api.get(`${baseUrl}/Relation`);
    return response.data;
  },
};
