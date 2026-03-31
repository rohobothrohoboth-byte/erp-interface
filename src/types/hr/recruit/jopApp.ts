import type { ApplicationStatus, EmpNature, Gender, JobPostingType } from "../enum";


// common types
export type UUID = string;

/* =======================
   JobAppListDto
======================= */
export interface JobAppListDto {
  appliedDate: string;
  status: ApplicationStatus;
  statusStr: string;
  applicant: string;
  jobPostingNum: string;
  position: string;
  department: string;
  period: string;
  appliedDateStr: string;
}

/* =======================
   JobAppIntAddDto
======================= */
export interface JobAppIntAddDto {
  employeeId: UUID;
  jobPostingId: UUID;
  coverLetter: string;
  file?: File | null;
}

/* =======================
   JobAppIntModDto
======================= */
export interface JobAppIntModDto {
  id: UUID;
  coverLetter: string;
  file?: File | null;
  rowVersion: string;
}

/* =======================
   JobAppExtAddDto
======================= */
export interface JobAppExtAddDto {
  status: ApplicationStatus;
  appliedDate: string;
  screeningScore: number;
  screeningComments?: string | null;
  updatedBy?: string | null;
  candidateId: UUID;
  jobPostingId: UUID;
  coverLetterId: UUID;
}

/* =======================
   JobAppExtModDto
======================= */
export interface JobAppExtModDto {
  id: UUID;
  status: ApplicationStatus;
  appliedDate: string;
  screeningScore: number;
  screeningComments?: string | null;
  updatedBy?: string | null;
  candidateId: UUID;
  jobPostingId: UUID;
  coverLetterId: UUID;
  rowVersion: string;
}

/* =======================
   JobAppIdDto
======================= */
export interface JobAppIdDto {
  applicantId?: UUID | null;
  employeeId?: UUID | null;
  jobPostingId: UUID;
  jobReqId: UUID;
  positionId: UUID;
  jgStepId: UUID;
  workforcePlanId: UUID;
  jobDecId: UUID;
  departmentId: UUID;
  periodId?: UUID | null;
}

/* =======================
   ApplicantJoinRow
======================= */
export interface ApplicantJoinRow {
  id: UUID;
  personId: UUID;
  firstName: string;
  middleName: string;
  lastName: string;
}

/* =======================
   JobAppInfoDto
======================= */
export interface JobAppInfoDto {
  postType: JobPostingType;
  applicantId?: UUID | null;
  employeeId?: UUID | null;
  positionId: UUID;
  jgStepId: UUID;
  departmentId: UUID;
  periodId: UUID;

  jobApplicationId: UUID;
  applicant: string;
  postNumber: string;
  reqNumber: string;
  planCode: string;

  title: string;
  desc: string;
  qualification: string;
  keySkills: string;
  workLocation: string;
  preGender: Gender;
  contractType: EmpNature;

  position: string;
  jgStep: string;
  department: string;
  period: string;
}