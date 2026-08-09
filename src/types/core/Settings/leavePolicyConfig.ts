import type { BaseDto } from '../../hr/BaseDto';

export type UUID  = string;

export interface LeavePolicyConfigListDto extends BaseDto {
  annualEntitlement: number;
  accrualFrequency: string;
  accrualRate: number;
  maxDaysPerReq: number;
  maxCarryOverDays: number;
  minServiceMonths: number;
  isActive: boolean;
  annualEntitlementStr: string;
  accrualFrequencyStr: string;
  accrualRateStr: string;
  maxDaysPerReqStr: string;
  maxCarryOverDaysStr: string;
  minServiceMonthsStr: string;
  isActiveStr: string;
  leavePolicy: string;
  fiscalYear: string;
}

export interface LeavePolicyConfigAddDto {
  annualEntitlement: number;
  accrualFrequency: string;  // Should match backend enum
  accrualRate: number;
  maxDaysPerReq: number;
  maxCarryOverDays: number;
  minServiceMonths: number;
  fiscalYearId: UUID;
  leavePolicyId: UUID;
}

export interface LeavePolicyConfigModDto {
  id: UUID;
  annualEntitlement: number;
  accrualFrequency: string;
  accrualRate: number;
  maxDaysPerReq: number;
  maxCarryOverDays: number;
  minServiceMonths: number;
  isActive: boolean;
  fiscalYearId: UUID;
  rowVersion: string;
}