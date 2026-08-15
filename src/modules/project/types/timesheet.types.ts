// src/modules/project/types/timesheet.types.ts
import { TimesheetStatus } from './project.enums';

export interface Timesheet {
    id: string;
    userId: string;
    userName: string;
    projectId: string;
    projectName: string;
    taskId: string | null;
    taskName: string | null;
    date: string;
    hoursWorked: number;
    overtimeHours: number;
    description: string;
    status: TimesheetStatus;
    hourlyRate: number;
    totalAmount: number;
    submittedAt: string | null;
    submittedById: string | null;
    submittedByName: string | null;
    approvedAt: string | null;
    approvedById: string | null;
    approvedByName: string | null;
    approvalNote: string;
    rejectedAt: string | null;
    rejectedById: string | null;
    rejectedByName: string | null;
    rejectionReason: string;
    isBillable: boolean;
    createdAt: string;
    createdBy: string;
}

export interface TimesheetCreateDto {
    userId: string;
    userName?: string;
    projectId: string;
    taskId?: string | null;
    date: string;
    hoursWorked: number;
    overtimeHours?: number;
    description?: string;
    hourlyRate?: number;
    isBillable?: boolean;
    createdBy?: string;
}

export interface TimesheetUpdateDto {
    hoursWorked?: number;
    overtimeHours?: number;
    description?: string;
    date?: string;
    taskId?: string | null;
    isBillable?: boolean;
    updatedBy?: string;
}

export interface TimesheetFilterDto {
    projectId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    status?: TimesheetStatus;
    page: number;
    pageSize: number;
    orderBy?: string;
    descending?: boolean;
}

export interface SubmitTimesheetDto {
    timesheetIds: string[];
    submittedBy?: string;
    notes?: string;
}

export interface ApproveTimesheetDto {
    timesheetIds: string[];
    approvedBy?: string;
    notes?: string;
}

export interface RejectTimesheetDto {
    timesheetIds: string[];
    rejectedBy?: string;
    reason: string;
}

export interface TimesheetSummaryDto {
    userId: string;
    fromDate: string;
    toDate: string;
    totalHours: number;
    overtimeHours: number;
    totalAmount: number;
    dailySummary: DailyTimesheetSummaryDto[];
    projectSummary: ProjectTimesheetSummaryDto[];
}

export interface DailyTimesheetSummaryDto {
    date: string;
    hours: number;
    overtime: number;
    amount: number;
}

export interface ProjectTimesheetSummaryDto {
    projectId: string;
    projectName: string;
    totalHours: number;
    totalAmount: number;
}