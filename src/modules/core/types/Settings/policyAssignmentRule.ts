import type { UUID } from "crypto";
import type { BaseDto } from "@/modules/hr/types/BaseDto";

export type { UUID };
export interface PolicyAssignmentRuleListDto extends BaseDto {
  code: string;
  name: string;
  priority: string; 
  isActive: boolean;
  effectiveFrom: string; 
  effectiveTo: string | null;
  effectiveFromStr: string;
  effectiveToStr: string;
  priorityStr: string;
  isActiveStr: string;
  leavePolicy: string; 
  leaveType: string; 
}

// Add DTO
export interface PolicyAssignmentRuleAddDto {
  code: string;
  name: string;
  priority: string; 
  effectiveFrom: string;
  effectiveTo: string | null; 
  leavePolicyId: string;
  leaveTypeId: string;  // ADD THIS
}

// Modify/Update DTO
export interface PolicyAssignmentRuleModDto {
  id: string;
  code: string;
  name: string;
  priority: string; 
  isActive: boolean;
  effectiveFrom: string; 
  effectiveTo: string | null; 
  rowVersion: string;
}
