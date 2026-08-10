import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/hr/types/BaseDto';

export type { UUID };

// Leave Type Types
export interface LeaveTypeListDto extends BaseDto {
  name: string;
  leaveCategory: string;
  requiresApproval: boolean;
  allowHalfDay: boolean;
  holidaysAsLeave: boolean;
  isActive: boolean;
  leaveCategoryStr: string;
  requiresApprovalStr: string;
  allowHalfDayStr: string;
  isActiveStr: string;
  holidaysAsLeaveStr: string;
}

export interface LeaveTypeAddDto {
  name: string;
  leaveCategory: string;
  requiresApproval: boolean;
  allowHalfDay: boolean;
  holidaysAsLeave: boolean;
}

export interface LeaveTypeModDto {
  id: UUID;
  name: string;
  leaveCategory: string;
  requiresApproval: boolean;
  allowHalfDay: boolean;
  holidaysAsLeave: boolean;
  isActive: boolean;
  rowVersion: string;
}