// src/services/hr/recruitment/vacancy/vacancy.api.ts

// Route through the API gateway (shared `api` client: base URL + auth + refresh).
// Previously used a direct axios instance to https://localhost:1217 which bypassed
// the gateway (ERR_CONNECTION_REFUSED).
import { api as recruitApi } from '@/shared/services/api';

const RECRUIT = import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1';

export interface VacancyListItem {
  id: string;
  postNumber: string;
  position: string;
  department: string;
  location: string;
  empNatureStr: string;
  datePosted: string;
  deadline: string;
  numOpen: number;
  preGenderStr?: string;
  jobGrade?: string;
  status: string;
  isInternal: boolean;
  postTypeStr: string;
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
  isInternal: boolean;
  postTypeStr: string;
  datePosted: string;
  deadline: string;
  jobDesc: string;
  keyRespoList: string[];
  reqQualList: string[];
  keySkillsList: string[];
}

export interface CreateApplicationRequest {
  jobPostingId: string;
  coverLetter: string;
  file?: File | null;
}

class VacancyApi {
  // Get all published vacancies
  async getPublishedVacancies(): Promise<VacancyListItem[]> {
    const response = await recruitApi.get(`${RECRUIT}/Vacancy/PublishedVacancy`);
    return response.data?.data || [];
  }

  // Get internal vacancies
  async getInternalVacancies(): Promise<VacancyListItem[]> {
    const response = await recruitApi.get(`${RECRUIT}/Vacancy/InternalVacancy`);
    return response.data?.data || [];
  }

  // Get external vacancies
  async getExternalVacancies(): Promise<VacancyListItem[]> {
    const response = await recruitApi.get(`${RECRUIT}/Vacancy/ExternalVacancy`);
    return response.data?.data || [];
  }

  // Get vacancy detail
  async getVacancyDetail(id: string): Promise<VacancyDetail> {
    const response = await recruitApi.get(`${RECRUIT}/Vacancy/GetVacancy/${id}`);
    return response.data?.data;
  }

  // Apply for a vacancy
  async applyForVacancy(data: CreateApplicationRequest): Promise<any> {
    const formData = new FormData();
    formData.append('jobPostingId', data.jobPostingId);
    formData.append('coverLetter', data.coverLetter);
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await recruitApi.post(
        `${RECRUIT}/JobApp/InternalApp`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
    );
    return response.data;
  }

  // Check if user has applied
  async hasApplied(vacancyId: string): Promise<boolean> {
    try {
      const response = await recruitApi.get(
          `${RECRUIT}/JobApp/HasApplied/${vacancyId}`
      );
      return response.data?.data || false;
    } catch {
      return false;
    }
  }
}

export const vacancyApi = new VacancyApi();