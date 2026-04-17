import type { BaseDto } from "./BaseDto";

export type UUID = string;

/* =======================
   JobAppListDto
======================= */
export interface JobAppListDto extends BaseDto {
  appliedDate: string;
  status: string;           // enum.ApplicationStatus numeric key
  statusStr: string;
  applicant: string;
  jobPostingNum: string;
  position: string;
  department: string;
  period: string;
  appliedDateStr?: string;
}

/* =======================
   JobAppIntAddDto
======================= */
export interface JobAppIntAddDto {
  jobPostingId: UUID;
  coverLetter: string;
}

/* =======================
   JobAppIntModDto
======================= */
export interface JobAppIntModDto {
  id: UUID;
  coverLetter: string;
  rowVersion: string;
}

/* =======================
   JobAppExtAddDto
======================= */
export interface JobAppExtAddDto {
  status: string;
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
  status: string;
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
  id: UUID;
  postType: string;
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
  preGender: string;
  contractType: string;
  position: string;
  jgStep: string;
  department: string;
  period: string;
}
