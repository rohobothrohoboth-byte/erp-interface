import type { BaseDto } from "./BaseDto";
import type { UUID } from 'crypto';

export type { UUID };

/* =======================
   WfpJobReqListDto
======================= */
export interface WfpJobReqListDto extends BaseDto {
  startDate: string;
  reqNumber: string;
  reqReason: string;
  reqQuantity: number;
  budgetCode: string;
  statusStr: string;
  position: string;
  jgStep: string;
  startDateStr: string;
}

/* =======================
   JobReqListDto  
======================= */
export interface JobReqListDto extends BaseDto {
  startDate: string;
  reqNumber: string;
  reqReason: string;
  reqQuantity: number;
  budgetCode: string;
  statusStr: string;
  position: string;
  jgStep: string;
  wfpCode: string;
  startDateStr: string;
}

/* =======================
   JobReqAddDto
======================= */
// src/types/hr/recruit/jobRequisition.ts

export interface JobReqAddDto {
  workforcePlanId: string; // This should be a string (GUID will be parsed by backend)
  position: string;
  departmentId: string;
  numOpen: number;
  jobGrade: string;
  salary: number;
  salaryCurrency: string;
  desc: string;
  qualification?: string;
  keySkills?: string;
  employmentType?: string;
  preferredGender?: string;
  workLocation: string;
  reqReason?: string;
}

/* =======================
   JobReqModDto
======================= */
export interface JobReqModDto {
  id: UUID;
  reqReason: string;
  reqPositions: number;
  budgetCode: string;
  startDate: string;
  positionId: UUID;
  jgStepId: UUID;
  keyRespo: string;
  desc: string;
  reqQual: string;
  keySkills: string;
  workLocation: string;
  preGender: string;
  empNature: string;
  workArr: string;
  rowVersion: string;
}
