import { api } from '../../../api';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/Vacancy`;

const extractError = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors)
    return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
  return error.message || 'An unexpected error occurred';
};

export interface VacancyListItem {
  id: string;
  numOpen: number;
  postNumber: string;
  position: string;
  department: string;
  location: string;
  empNatureStr: string;
  preGenderStr: string;
  jobGrade: string;
  datePosted: string;
  deadline: string;
}

export interface VacancyDetail {
  id: string;
  numOpen: number;
  postNumber: string;
  position: string;
  department: string;
  location: string;
  jobGrade: string;
  salary: string;
  empNatureStr: string;
  preGenderStr: string;
  workArrStr: string;
  datePosted: string;
  deadline: string;
  jobDesc: string;
  keyRespo: string[];
  reqQual: string[];
  keySkills: string[];
}

export const vacancyApi = {
  getAll: async (): Promise<VacancyListItem[]> => {
    try {
      const res = await api.get(`${BASE}/PublishedVacancy`);
      const raw = res.data?.data ?? [];
      return Array.isArray(raw) ? raw : [raw];
    } catch (e) { throw new Error(extractError(e)); }
  },

  getById: async (id: string): Promise<VacancyDetail> => {
    try {
      const res = await api.get(`${BASE}/VacancyDetail/${id}`);
      return res.data.data;
    } catch (e) { throw new Error(extractError(e)); }
  },
};
