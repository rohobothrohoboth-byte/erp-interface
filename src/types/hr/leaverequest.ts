import type { UUID } from 'crypto';
import type { BaseDto } from './BaseDto';

export type { UUID };
export interface LeaveRequestListDto extends BaseDto {
  employeeId: UUID; 
  approvedById?: UUID; 
  leaveTypeId: UUID;
  startDate: string | Date; 
  endDate: string | Date; 
  dateRequested: string | Date; 
  dateApproved?: string | Date; 
  comments: string;
  daysRequestedStr: string;
  isHalfDayStr: string;
  statusStr: string;
  startDateStr: string; 
  startDateStrAm: string; 
  endDateStr: string; 
  endDateStrAm: string; 
  dateApprovedStr: string; 
  dateApprovedStrAm: string; 
  dateRequestedStr: string; 
  dateRequestedStrAm: string; 
  approvedBy: string;
  employee: string;
  leaveType: string;
  rowVersion?: string;  // Add this field
  xmin?: string;        // Alternative field name from backend
}

export interface LeaveTypeDto {
  id: UUID;
  name: string;
}
export interface LeaveRequestAddDto {
  leaveTypeId: UUID;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  comments: string;
  status?: string;
  approvalChainId?: UUID;
  currentStepId?: UUID;
  currentStepOrder?: number;
}

export interface LeaveRequestModDto {
  id: UUID;
  leaveTypeId: UUID;
  startDate: string | Date; 
  endDate: string | Date; 
  isHalfDay: boolean;
  comments: string;
  rowVersion: string;
}