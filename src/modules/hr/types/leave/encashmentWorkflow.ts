// src/types/hr/leave/encashmentWorkflow.ts

export interface EncashmentRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    requestedDays: number;
    remainingBalance: number;
    requestedDate: string;
    preferredMonth?: string; // Month when they want encashment
    reason?: string;
    status: EncashmentStatus;
    currentApprovalLevel: number;
    approvals: Approval[];
    financialImpact: FinancialImpact;
    createdAt: string;
    updatedAt: string;
}

export type EncashmentStatus =
    | 'DRAFT'
    | 'PENDING_MANAGER'
    | 'PENDING_HR'
    | 'PENDING_FINANCE'
    | 'PENDING_CEO'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'PROCESSED';

export interface Approval {
    level: number;
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comments?: string;
    approvedAt?: string;
}

export interface FinancialImpact {
    totalAmount: number;
    taxAmount: number;
    netAmount: number;
    budgetImpact?: string;
    costCenter?: string;
    fiscalYearImpact: number;
}

export interface EncashmentPolicy {
    id: string;
    leaveTypeId: string;
    maxEncashableDaysPerYear: number;
    minEncashableDays: number;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    requiresFinanceApproval: boolean;
    requiresCEOApproval: boolean;
    approvalThresholds: {
        manager: number;  // Max days manager can approve without HR
        hr: number;       // Max days HR can approve without Finance
        finance: number;  // Max days Finance can approve without CEO
    };
    encashmentWindowStart: string; // Month (e.g., "November")
    encashmentWindowEnd: string;   // Month (e.g., "December")
    notificationEmails: string[];
}