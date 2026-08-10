import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/hr/types/BaseDto';

export type { UUID };
export interface LeavePolicyAccrualListDto extends BaseDto {
  leavePolicyId: UUID;
  entitlement: number;
  frequency: string;
  accrualRate: number;
  minServiceMonths: number;
  maxCarryoverDays: number;
  carryoverExpiryDays: number;
  frequencyStr: string;
  leavePolicy: string;
}

export interface LeavePolicyAccrualAddDto {
  leavePolicyId: UUID;
  entitlement: number;
  frequency: string;
  accrualRate: number;
  minServiceMonths: number;
  maxCarryoverDays: number;
  carryoverExpiryDays: number;
}

export interface LeavePolicyAccrualModDto {
  id: UUID;
  leavePolicyId: UUID;
  entitlement: number;
  frequency: string;
  accrualRate: number;
  minServiceMonths: number;
  maxCarryoverDays: number;
  carryoverExpiryDays: number;
  rowVersion: string;
}

// Additional UI types for accrual policies
export interface AccrualFrequencyOptionDto {
  id: string;
  name: string;
  nameAm?: string;
}

export interface LeavePolicyAccrualFilters {
  searchTerm: string;
  frequency?: string;
  minServiceMonths?: number;
  maxCarryoverDays?: number;
  leavePolicyId?: UUID;
}

export interface LeavePolicyAccrualTableData {
  data: LeavePolicyAccrualListDto[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

export interface LeavePolicyAccrualFormData {
  leavePolicyId: UUID;
  entitlement: number;
  frequency: string;
  accrualRate: number;
  minServiceMonths: number;
  maxCarryoverDays: number;
  carryoverExpiryDays: number;
}

export interface LeavePolicyAccrualValidationResult {
  isValid: boolean;
  errors: {
    leavePolicyId?: string;
    entitlement?: string;
    frequency?: string;
    accrualRate?: string;
    minServiceMonths?: string;
    maxCarryoverDays?: string;
    carryoverExpiryDays?: string;
  };
}

export interface AccrualPolicyConfig {
  id: UUID;
  leavePolicyId: UUID;
  leavePolicyName: string;
  entitlement: number;
  frequency: string;
  accrualRate: number;
  minServiceMonths: number;
  maxCarryoverDays: number;
  carryoverExpiryDays: number;
}