import type { BaseDto } from "../BaseDto";
import type { EmpNature, Gender, ReviewStat } from "../enum";

export type UUID = string;
// ---------- JobReqListDto ----------
export interface JobReqListDto extends BaseDto {
  jgStepId: UUID;
  positionId: UUID;
  jobDecId: UUID;
  workforcePlanId: UUID;
  status: ReviewStat;
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

// ---------- JobReqAddDto ----------
export interface JobReqAddDto {
  reqNumber: string;
  reqReason: string;
  reqPositions: number;
  budgetCode: string;
  startDate: string;
  positionId: UUID;
  jgStepId: UUID;   
  workforcePlanId: UUID;

  title: string;
  desc: string;
  qualification: string;
  keySkills: string;
  workLocation: string;
  preGender: Gender;
  contractType: EmpNature;
}

// ---------- JobReqModDto ----------
export interface JobReqModDto {
  id: UUID;
  reqReason: string;
  reqPositions: number;
  budgetCode: string;
  startDate: string;
  positionId: UUID;
  jgStepId: UUID;   
  title: string;
  desc: string;
  qualification: string;
  keySkills: string;
  workLocation: string;
  preGender: Gender;
  contractType: EmpNature;
  rowVersion: string;
}