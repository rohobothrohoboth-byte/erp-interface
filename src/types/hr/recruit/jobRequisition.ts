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
export interface JobReqAddDto {
  reqReason: string;
  reqPositions: number;
  budgetCode: string;
  startDate: string;
  positionId: UUID;
  jgStepId: UUID;
  workforcePlanId: UUID;
  keyRespo: string;
  desc: string;
  reqQual: string;
  keySkills: string;
  workLocation: string;
  preGender: string;   // enum.Gender numeric key
  empNature: string;   // enum.EmpNature numeric key
  workArr: string;     // enum.WorkArrangement numeric key
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
