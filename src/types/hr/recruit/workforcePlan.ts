import type { BaseDto } from "../BaseDto";
import type { ReqStatus } from "../enum";

export type UUID = string;

export interface WorkforcePlanListDto extends BaseDto{
   status: ReqStatus;
  departmentId: UUID;
  periodId?: UUID;
   requistionById: UUID;
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
}

export interface WorkforcePlanAddDto {
  title: string;
  desc: string;
  startDate: string;
  endDate: string;
  totalPositions: number;
  periodId?: UUID;
   requistionById: UUID;
}

export interface WorkforcePlanModDto {
  id: UUID;
  title: string;
  desc: string;
   startDate: Date;
    endDate: Date;
    totalPositions: number;
  rowVersion: string;
}




