import type { UUID } from "crypto";
import type { BaseDto } from "@/modules/hr/types/BaseDto";

export type { UUID };

export interface LeaveAppChainListDto extends BaseDto {
  effectiveFrom: Date;
  effectiveTo: Date | null;
  isActive: boolean;
  effectiveFromStr: string;
  effectiveToStr: string;
  isActiveStr: string;
  addedSteps: number;
  leavePolicy: string;
}

export interface LeaveAppChainAddDto {
  leavePolicyId: UUID;
  effectiveFrom: Date; 
  effectiveTo?: Date | null;
}

export interface LeaveAppChainModDto {
  id: UUID;
  leavePolicyId: UUID;
  effectiveFrom: Date; 
  effectiveTo?: Date | null; 
  isActive: boolean;
  rowVersion: string;
}
