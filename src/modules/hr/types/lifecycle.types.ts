// Types for the employee lifecycle aggregates (Contract, Promotion, Transfer).
// These map to the HRM Profile microservice endpoints reached through the gateway.

export interface Contract {
  id: string;
  employeeId: string;
  employeeName?: string;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  salary?: number | null;
  status: string;
  notes?: string | null;
}

export interface ContractCreate {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  salary?: number | null;
  status: string;
  notes?: string | null;
}

export type ContractUpdate = ContractCreate;

export interface Promotion {
  id: string;
  employeeId: string;
  employeeName?: string;
  fromPosition?: string | null;
  toPosition: string;
  effectiveDate: string;
  reason?: string | null;
  status: string;
}

export interface PromotionCreate {
  employeeId: string;
  fromPosition?: string | null;
  toPosition: string;
  effectiveDate: string;
  reason?: string | null;
  status: string;
}

export type PromotionUpdate = PromotionCreate;

export interface Transfer {
  id: string;
  employeeId: string;
  employeeName?: string;
  fromBranch?: string | null;
  toBranch?: string | null;
  fromDepartment?: string | null;
  toDepartment?: string | null;
  effectiveDate: string;
  reason?: string | null;
  status: string;
}

export interface TransferCreate {
  employeeId: string;
  fromBranch?: string | null;
  toBranch?: string | null;
  fromDepartment?: string | null;
  toDepartment?: string | null;
  effectiveDate: string;
  reason?: string | null;
  status: string;
}

export type TransferUpdate = TransferCreate;
