// Payment Approval Chain Types
export interface PaymentApprovalChain {
  chain_id: string;
  chain_name: string;
  branch_id?: string;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  steps: PaymentApprovalStep[];
}

export interface PaymentApprovalStep {
  step_id: string;
  step_order: number;
  step_name: string;
  approver_role: string;
  employee_id?: string;
  employee_name?: string;
  is_final: boolean;
}

export interface PaymentApprovalChainAddDto {
  chain_name: string;
  branch_id?: string;
  effective_from: Date;
  effective_to?: Date | null;
}

export interface PaymentApprovalStepAddDto {
  step_name: string;
  step_order: number;
  approver_role: string;
  employee_id?: string | null;
  is_final: boolean;
}

export interface PaymentApprovalStepModDto extends PaymentApprovalStepAddDto {
  step_id: string;
}

export type UUID = string;
