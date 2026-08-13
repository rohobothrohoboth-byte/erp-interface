import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';

export type { UUID };

export interface DeptListDto extends BaseDto {
  branchId: UUID;
  name: string;
  nameAm: string;
  deptStat: '0' | '1';
  branch: string;
  branchAm: string;
  deptStatStr: string;
  managerName?: string;
  description?: string;
  phone?: string;
  email?: string;
}

export interface AddDeptDto {
  name: string;
  nameAm: string;
  branchId: UUID;
  managerName?: string;
  description?: string;
  phone?: string;
  email?: string;
}

export interface EditDeptDto {
  id: UUID;
  name: string;
  nameAm: string;
  deptStat: string;
  branchId: UUID;
  rowVersion: string;
  managerName?: string;
  description?: string;
  phone?: string;
  email?: string;
}

export interface BranchDeptList {
  id: UUID;
  branchId: UUID;
  dept: string;
  branch: string;
}