import type { BaseDto } from "@/modules/hr/types/recruit/BaseDto";
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
   Mirrors backend Recruit.Domain.DTOs.JobReqAddDto exactly.
======================= */
export interface JobReqAddDto {
  reqReason: string;
  reqPositions: number;
  budgetCode: string;
  startDate: string;        // ISO date; backend binds to DateTime
  positionId: string;       // Cor.HRMM.Position id
  jgStepId: string;         // Cor.HRMM.JgStep id
  workforcePlanId: string;  // WorkforcePlan id

  keyRespo: string;
  desc: string;
  reqQual: string;
  keySkills: string;
  workLocation: string;
  preGender: string;        // enum.Gender key
  empNature: string;        // enum.EmpNature key
  workArr: string;          // enum.WorkArrangement key
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
