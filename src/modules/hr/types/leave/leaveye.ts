// src/types/hr/leave/leaveye.ts
export interface FiscalYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: string;
}

export interface CarryoverPreview {
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    remainingBalance: number;
    maxCarryoverDays: number;
    carryoverAmount: number;
    encashmentAmount: number;
    lostAmount: number;
    fiscalYearName?: string;
}

export interface ProcessResult {
    success: boolean;
    message: string;
    employeesProcessed: number;
    carryoverRecordsCreated: number;
    encashmentRecordsCreated: number;
    errors: Array<{ errorMessage: string }>;
    processedAt: string;
}

// src/types/hr/leave/leaveye.ts
export interface EncashmentRecord {
    id: string;
    employeeId: string;
    employeeName?: string;
    leaveTypeId: string;
    leaveTypeName?: string;
    encashmentDays: number;
    ratePerDay: number;
    totalAmount: number;
    taxAmount: number;
    netAmount: number;
    status: string; // Will come from workflow: 'Pending', 'Approved', 'Rejected', etc.
    requestDate?: string;
    createdAt: string;
    updatedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
    remarks?: string;
    fiscalYearId?: string;
    // Workflow related fields
    leaveAppChainId?: string;
    currentStepId?: string;
    isDeleted?: boolean;
}

export interface EncashmentConfig {
    allowEncashment: boolean;
    maxEncashableDays: number;
    encashmentRate: number;
    requiresApproval: boolean;
}

export interface SelectedEncashment {
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    remainingBalance: number;
    maxEncashableDays: number;
    totalEncashedThisYear: number;
}

export interface EncashmentRequest {
    employeeId: string;
    leaveTypeId: string;
    encashmentDays: number;
}