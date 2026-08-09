export interface EmpTerminationListDto {
  id: string;
  status: string;
  statusName: string;
  terminationType: string;
  lastWorkingDate: string;
  noticeDate?: string | null;
  reason: string;
  comments?: string | null;
  exitInterviewNotes?: string | null;
  approvedById?: string | null;
  approvedDate?: string | null;
  appliedDate?: string | null;
  requestFinalPay: boolean;
  requestLeaveSettlement: boolean;
  settlementPayrollRunId?: string | null;
  settlementStatus?: string | null;
  settlementNotes?: string | null;
  leaveUnpaidDaysSnapshot?: number | null;
  employeeId: string;
  offboardingTotal: number;
  offboardingCompleted: number;
  rowVersion: string;
  tasks?: EmpOffboardingTaskDto[] | null;
}

export interface EmpTerminationAddDto {
  employeeId: string;
  lastWorkingDate: string;
  noticeDate?: string | null;
  reason: string;
  terminationType?: string;
  comments?: string | null;
  exitInterviewNotes?: string | null;
  requestFinalPay?: boolean;
  requestLeaveSettlement?: boolean;
  seedDefaultChecklist?: boolean;
}

export interface EmpTerminationDecisionDto {
  id: string;
  approvedById?: string | null;
  comments?: string | null;
  exitInterviewNotes?: string | null;
  rowVersion: string;
}

export interface EmpOffboardingTaskDto {
  id: string;
  terminationId: string;
  category: string;
  title: string;
  status: string;
  assignedToId?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  sortOrder: number;
  rowVersion: string;
}

export interface EmpOffboardingTaskUpdateDto {
  id: string;
  status: string;
  assignedToId?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  rowVersion: string;
}
