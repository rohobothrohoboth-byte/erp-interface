// src/services/hr/recruitment/applicant/applicant.api.ts

import axios from 'axios';
import type { ApplicantListDto, ApplicantDetailDto } from '@/modules/hr/types/recruit/applicant/applicant.types';

// Direct API client for Recruit service
const recruitApi = axios.create({
  baseURL: import.meta.env.VITE_RECRUIT_API_URL || 'https://localhost:1217',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
recruitApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
recruitApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

export interface ApplicantListDto {
  id: string;
  applicant: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  statusStr: string;
  appliedDate: string;
  jobPostingNum?: string;
  jobPostingId?: string;
  dateAdd?: string;
  dateMod?: string;
  isDeleted: boolean;
  rowVersion: string;
}

export interface ApplicantDetailDto extends ApplicantListDto {
  coverLetter?: string;
  jobPostingId?: string;
  // ✅ Additional fields for evaluation
  jobApplicationId?: string;
  postNumber?: string;
  reqNumber?: string;
  jgStep?: string;
  title?: string;
  contractType?: string;
  workLocation?: string;
  period?: string;
  qualification?: string;
  keySkills?: string;
  planCode?: string;
  desc?: string;
  preGender?: string;
  positionId?: string;
  jgStepId?: string;
  departmentId?: string;
  periodId?: string;
}

class ApplicantApi {
  // Get all internal applicants
  async getAllApplicants(): Promise<ApplicantListDto[]> {
    const response = await recruitApi.post('/api/hrm/recruit/v1/Applicant/AllIntApp');
    return response.data?.data || [];
  }

  // Get applicant detail
  async getApplicantDetail(id: string): Promise<ApplicantDetailDto> {
    const response = await recruitApi.get(`/api/hrm/recruit/v1/Applicant/GetIntApp/${id}`);
    return response.data?.data;
  }

  // ✅ Get applicants by job posting
  async getApplicantsByJobPosting(jobPostingId: string): Promise<ApplicantListDto[]> {
    const response = await recruitApi.get(`/api/hrm/recruit/v1/Applicant/JobPostAllIntApp/${jobPostingId}`);
    return response.data?.data || [];
  }

  // Update applicant status
  async updateApplicantStatus(applicantId: string, status: string, reason?: string): Promise<any> {
    const response = await recruitApi.put(`/api/hrm/recruit/v1/Applicant/UpdateStatus/${applicantId}`, {
      status,
      reason
    });
    return response.data;
  }
}

export const applicantApi = new ApplicantApi();