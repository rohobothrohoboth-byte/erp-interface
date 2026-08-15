// src/modules/project/types/change.types.ts
import { ChangeType, ChangePriority, ChangeStatus } from './project.enums';

export interface ProjectChange {
    id: string;
    title: string;
    description: string;
    projectId: string;
    projectName: string;
    type: ChangeType;
    priority: ChangePriority;
    status: ChangeStatus;
    currentState: string;
    proposedState: string;
    justification: string;
    impactAnalysis: string;
    costImpact: number;
    scheduleImpact: number;
    requestedByName: string;
    requestedAt: string;
    reviewedByName: string;
    reviewedAt: string | null;
    reviewNotes: string;
    approvedByName: string;
    approvedAt: string | null;
    approvalNotes: string;
    implementedAt: string | null;
    implementedByName: string;
    createdAt: string;
    createdBy: string;
}

export interface ChangeCreateDto {
    title: string;
    description?: string;
    projectId: string;
    type: ChangeType;
    priority: ChangePriority;
    currentState?: string;
    proposedState?: string;
    justification?: string;
    impactAnalysis?: string;
    costImpact?: number;
    scheduleImpact?: number;
    requestedByName?: string;
    createdBy?: string;
}

export interface ChangeUpdateDto {
    title?: string;
    description?: string;
    type?: ChangeType;
    priority?: ChangePriority;
    status?: ChangeStatus;
    currentState?: string;
    proposedState?: string;
    justification?: string;
    impactAnalysis?: string;
    costImpact?: number;
    scheduleImpact?: number;
    reviewNotes?: string;
    approvalNotes?: string;
    updatedBy?: string;
}

export interface ChangeSummaryDto {
    projectId: string;
    totalChanges: number;
    approvedChanges: number;
    rejectedChanges: number;
    implementedChanges: number;
    pendingChanges: number;
    totalCostImpact: number;
    totalScheduleImpact: number;
    changesByType: Record<string, number>;
    changesByStatus: Record<string, number>;
}