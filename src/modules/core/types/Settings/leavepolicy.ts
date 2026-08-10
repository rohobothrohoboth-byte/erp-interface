import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/hr/types/BaseDto';

export type { UUID };

// Leave Policy Types
// types/core/Settings/leavepolicy.ts
export interface LeavePolicyListDto extends BaseDto {
  leaveTypeId: UUID;
  code: string;
  name: string;
  allowEncashment: boolean;
  requiresAttachment: boolean;
  status: string;
  leaveType: string;
  statusStr: string;
  allowEncashmentStr: string;
  requiresAttachmentStr: string;
  rowVersion?: string; // Add this field - make it optional
}
// In your types file (leavepolicy.ts)
export interface LeavePolicyAddDto {
  code: string;
  name: string;
  allowEncashment: boolean;
  requiresAttachment: boolean;
  leaveTypeId: UUID;
  status?: string;  // Make status optional since backend sets it
}

export interface LeavePolicyModDto {
  id: UUID;
  code: string;
  name: string;
  allowEncashment: boolean;
  requiresAttachment: boolean;
  status: string;
  leaveTypeId: UUID;
  rowVersion: string;
}

// Service response types (if needed for dropdowns/selects)
export interface LeaveTypeOptionDto {
  id: UUID;
  name: string;
  nameAm?: string;
}

export interface BooleanOptionDto {
  id: boolean;
  name: string;
  nameAm?: string;
}

// Combined types for UI
export type LeavePolicyFilterType =
  | 'all'
  | 'withAttachment'
  | 'withoutAttachment'
  | 'holidaysAsLeave'
  | 'byLeaveType';

export interface LeavePolicyFilters {
  searchTerm: string;
  requiresAttachment?: boolean;
  holidaysAsLeave?: boolean;
  leaveTypeId?: UUID;
  minDuration?: number;
  maxDuration?: number;
}

export interface LeavePolicyTableData {
  data: LeavePolicyListDto[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

// Form data types
export interface LeavePolicyFormData {
  name: string;
  requiresAttachment: boolean;
  minDurPerReq: number;
  maxDurPerReq: number;
  holidaysAsLeave: boolean;
  leaveTypeId: UUID;
}

// Validation types
export interface LeavePolicyValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    requiresAttachment?: string;
    minDurPerReq?: string;
    maxDurPerReq?: string;
    holidaysAsLeave?: string;
    leaveTypeId?: string;
  };
}

// Duration validation types
export interface DurationValidation {
  minDuration: number;
  maxDuration: number;
  isValid: boolean;
  error?: string;
}

// Policy configuration types
export interface LeavePolicyConfig {
  id: UUID;
  name: string;
  requiresAttachment: boolean;
  minDuration: number;
  maxDuration: number;
  holidaysAsLeave: boolean;
  leaveTypeName: string;
}