import type { BaseDto } from "./BaseDto";
import type { UUID } from 'crypto';

export type { UUID };

/* =======================
   WorkforcePlanListDto
======================= */
export interface WorkforcePlanListDto extends BaseDto {
  planCode: string;
  title: string;
  desc: string;
  startDate: string;
  endDate: string;
  totalPositions: number;
  appPositions: number;
  statusStr: string;
  department: string;
  period: string;
  requistionBy: string;
}

/* =======================
   WorkforcePlanAddDto
======================= */
export interface WorkforcePlanAddDto {
  title: string;
  desc: string;
  startDate: string;
  endDate: string;
  totalPositions: number;
  periodId?: UUID;
}

/* =======================
   WorkforcePlanModDto
======================= */
export interface WorkforcePlanModDto {
  id: UUID;
  title: string;
  desc: string;
  startDate: Date;
  endDate: Date;
  totalPositions: number;
  rowVersion: string;
}
