// src/types/hr/recruit/jobPosting.ts

export interface JobPostingListDto {
  id: string;
  postNumber: string;
  reqNumber: string;
  statusStr: string;
  postTypeStr: string;
  reqAppQuan: string;
  publishedDateStr: string;
  deadlineDateStr: string;
  closedDateStr?: string;
  reqQuantity?: number;
  appQuantity?: number;
  status?: string;
  postType?: string;
  publishedDate?: string;
  deadlineDate?: string;
  closedDate?: string;
  rowVersion: string;
  isDeleted: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface JobPostingViewDto {
  id: string;
  postNumber: string;
  reqNumber: string;
  statusStr: string;
  postTypeStr: string;
  publishedDateStr: string;
  deadlineDateStr: string;
  closedDateStr?: string;
  reqReason: string;
  reqQuantity: number;
  appQuantity: number;
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
  publishedDate: string;
  deadlineDate: string;
  closedDate?: string;
  rowVersion: string;
  isDeleted: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface JobPostingAddDto {
  id: string;
  postType: string;
  deadlineDate: string;
}

export interface JobPostingModDto {
  id: string;
  postType: string;
  deadlineDate: string;
  status?: string;
  rowVersion: string;
}