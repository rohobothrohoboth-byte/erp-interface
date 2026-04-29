import type { BaseDto } from "./BaseDto";
import type { UUID } from 'crypto';

export type { UUID };

/* =======================
   JobPostingListDto
======================= */
export interface JobPostingListDto extends BaseDto {
  postNumber: string;
  reqNumber: string;
  statusStr: string;
  postTypeStr: string;
  reqAppQuan: string;
  publishedDateStr?: string;
  deadlineDateStr?: string;
  closedDateStr?: string;
}

/* =======================
   JobPostingAddDto
======================= */
export interface JobPostingAddDto {
  postType: string;        // enum.JobPostingType numeric key
  deadlineDate: string;    // ISO string
  id: UUID;                // JobRequisition or WorkforcePlan ID
}

/* =======================
   JobPostingModDto
======================= */
export interface JobPostingModDto {
  id: UUID;
  status: string;          // enum.PostStatus numeric key
  postType: string;        // enum.JobPostingType numeric key
  deadlineDate: string;    // ISO string
  rowVersion: string;
}

/* =======================
   JobPostingViewDto
======================= */
export interface JobPostingViewDto extends BaseDto {
  publishedDateStr?: string;
  deadlineDateStr?: string;
  closedDateStr?: string;
  postNumber: string;
  reqNumber: string;
  statusStr: string;
  postTypeStr: string;
  reqReason: string;
  reqQuantity?: number;
  appQuantity?: number;
  budgetCode: string;
  position: string;
  jgStep: string;
  department: string;
  period: string;
  requistionBy: string;
  title: string;
  desc: string;
  qualification: string;
  keySkills: string;
  workLocation: string;
  preGenderStr: string;
  contractTypeStr: string;
}
