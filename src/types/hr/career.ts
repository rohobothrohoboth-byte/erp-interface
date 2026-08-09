export interface EmpContractListDto {
  id: string;
  contractNumber: string;
  status: string;
  statusName: string;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  signedDate?: string | null;
  terminatedDate?: string | null;
  terminationReason?: string | null;
  documentRef?: string | null;
  notes?: string | null;
  employeeId: string;
  renewedFromId?: string | null;
  rowVersion: string;
}

export interface EmpContractAddDto {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  signedDate?: string | null;
  documentRef?: string | null;
  notes?: string | null;
  activateImmediately?: boolean;
}

export interface EmpContractTerminateDto {
  id: string;
  reason: string;
  terminatedDate?: string | null;
  rowVersion: string;
}

export interface EmpPromotionListDto {
  id: string;
  status: string;
  statusName: string;
  effectiveDate: string;
  reason?: string | null;
  comments?: string | null;
  approvedById?: string | null;
  approvedDate?: string | null;
  appliedDate?: string | null;
  employeeId: string;
  fromJobGradeId: string;
  fromPositionId: string;
  fromDepartmentId: string;
  fromJgStepId?: string | null;
  toJobGradeId: string;
  toPositionId: string;
  toDepartmentId: string;
  toJgStepId?: string | null;
  rowVersion: string;
}

export interface EmpPromotionAddDto {
  employeeId: string;
  effectiveDate: string;
  toJobGradeId: string;
  toPositionId: string;
  toDepartmentId: string;
  toJgStepId?: string | null;
  reason?: string | null;
}

export interface EmpDecisionDto {
  id: string;
  approvedById?: string | null;
  comments?: string | null;
  rowVersion: string;
}

export interface EmpTransferListDto {
  id: string;
  status: string;
  statusName: string;
  effectiveDate: string;
  reason?: string | null;
  comments?: string | null;
  approvedById?: string | null;
  approvedDate?: string | null;
  appliedDate?: string | null;
  employeeId: string;
  fromDepartmentId: string;
  fromPositionId: string;
  fromJobGradeId?: string | null;
  toDepartmentId: string;
  toPositionId: string;
  toJobGradeId?: string | null;
  rowVersion: string;
}

export interface EmpTransferAddDto {
  employeeId: string;
  effectiveDate: string;
  toDepartmentId: string;
  toPositionId: string;
  toJobGradeId?: string | null;
  reason?: string | null;
}
