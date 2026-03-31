import type { BaseDto } from "../BaseDto";
import type { JobPostingType, PostingStatus } from "../enum";


// common type
export type UUID = string;

/* =======================
   JobPostingListDto
======================= */
export interface JobPostingListDto extends BaseDto {
  reqQuantity?: number;
  appQuantity?: number;

  publishedDate: string;
  deadlineDate: string;
  closedDate?: string;

  status: PostingStatus;     
  postType: JobPostingType;  

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
  postType: JobPostingType;  
  deadlineDate: string;
  id: UUID;
}

/* =======================
   JobPostingModDto
======================= */
export interface JobPostingModDto {
  id: UUID;
  status: PostingStatus;      
  postType: JobPostingType;   
  deadlineDate: string;
  rowVersion: string;
}

/* =======================
   JobPostingViewDto
======================= */
export interface JobPostingViewDto {
  id?: UUID;

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