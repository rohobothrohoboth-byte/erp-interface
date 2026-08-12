// src/services/hr/recruitment/applicant/applicant.api.ts

// Route through the API gateway (shared `api` client handles base URL + auth +
// token refresh). Previously this used a direct axios instance pointed at
// `https://localhost:1217`, which bypassed the gateway and failed with
// ERR_CONNECTION_REFUSED. The gateway maps `/hrm/recruit/**` -> `api/hrm/recruit/**`.
import { api } from '@/shared/services/api';

const RECRUIT = import.meta.env.VITE_HRM_RECRUIT_URL || '/hrm/recruit/v1';

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
    const response = await api.post(`${RECRUIT}/Applicant/AllIntApp`);
    return response.data?.data || [];
  }

  // Get applicant detail
  async getApplicantDetail(id: string): Promise<ApplicantDetailDto> {
    const response = await api.get(`${RECRUIT}/Applicant/GetIntApp/${id}`);
    return response.data?.data;
  }

  // ✅ Get applicants by job posting
  async getApplicantsByJobPosting(jobPostingId: string): Promise<ApplicantListDto[]> {
    const response = await api.get(`${RECRUIT}/Applicant/JobPostAllIntApp/${jobPostingId}`);
    return response.data?.data || [];
  }

  // Update applicant status
  async updateApplicantStatus(applicantId: string, status: string, reason?: string): Promise<any> {
    const response = await api.put(`${RECRUIT}/Applicant/UpdateStatus/${applicantId}`, {
      status,
      reason
    });
    return response.data;
  }
}

export const applicantApi = new ApplicantApi();