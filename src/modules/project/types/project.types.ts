// src/modules/project/types/project.types.ts
// ============================================================
// PROJECT DTOs
// ============================================================

import {
    ProjectStatus,
    ProjectType,
    TaskStatus,
    TaskPriority,
    PhaseStatus,

} from './project.enums';
import type{
    ProjectMilestone
} from './milestone.types';
import type{
    ProjectResource
} from './resource.types';
import type{
    ProjectBudget
} from './budget.types';
import type{
    ProjectRisk
} from './risk.types';
import type{
    ProjectIssue
} from './issue.types';

// ============================================================
// PROJECT DTOs
// ============================================================

export interface Project {
    id: string;
    name: string;
    code: string;
    description: string;
    status: ProjectStatus;
    type: ProjectType;
    startDate: string;
    endDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    projectManagerId: string | null;
    projectManagerName: string;
    departmentId: string | null;
    departmentName: string;
    budget: number;
    actualCost: number;
    totalBilled: number;
    priority: number;
    customerId: string | null;
    customerName: string;
    vendorId: string | null;
    vendorName: string;
    completionPercentage: number;
    tags: string;
    customFields?: string;
    metadata?: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string;
    taskCount: number;
    milestoneCount: number;
    resourceCount: number;
    phases?: ProjectPhase[];
    tasks?: ProjectTask[];
    milestones?: ProjectMilestone[];
    resources?: ProjectResource[];
    budgets?: ProjectBudget[];
    risks?: ProjectRisk[];
    issues?: ProjectIssue[];
}

export interface ProjectPhase {
    id: string;
    name: string;
    description: string;
    projectId: string;
    projectName?: string;
    order: number;
    status: PhaseStatus;
    startDate: string;
    endDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    completionPercentage: number;
    customFields?: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string;
    taskCount?: number;
    milestoneCount?: number;
    tasks?: ProjectTask[];
    milestones?: ProjectMilestone[];
}

export interface ProjectCreateDto {
    name: string;
    description?: string;
    type: ProjectType;
    startDate: string;
    endDate?: string | null;
    budget?: number;
    projectManagerId?: string | null;
    projectManagerName?: string;
    departmentId?: string | null;
    departmentName?: string;
    priority?: number;
    customerId?: string | null;
    customerName?: string;
    tags?: string;
    createdBy?: string;
}

export interface ProjectUpdateDto {
    id?: string;
    name?: string;
    description?: string;
    status?: ProjectStatus;
    startDate?: string;
    endDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    budget?: number;
    actualCost?: number;
    totalBilled?: number;
    projectManagerId?: string | null;
    projectManagerName?: string;
    priority?: number;
    completionPercentage?: number;
    tags?: string;
    updatedBy?: string;
    rowVersion?: string;
}

export interface ProjectFilterDto {
    search?: string;
    status?: ProjectStatus;
    type?: ProjectType;
    projectManagerId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    customerId?: string;
    page: number;
    pageSize: number;
    orderBy?: string;
    descending?: boolean;
}

// ============================================================
// TASK DTOs
// ============================================================

export interface ProjectTask {
    id: string;
    title: string;
    description: string;
    projectId: string;
    projectName: string;
    parentTaskId: string | null;
    parentTaskTitle: string | null;
    phaseId: string | null;
    phaseName: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    startDate: string;
    dueDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    estimatedHours: number;
    actualHours: number;
    remainingHours: number;
    estimatedCost: number;
    actualCost: number;
    assigneeId: string | null;
    assigneeName: string;
    reviewerId: string | null;
    reviewerName: string;
    order: number;
    completionPercentage: number;
    tags: string;
    customFields?: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string;
    subTasks: ProjectTask[];
    subTaskCount: number;
    commentCount: number;
    isOverdue: boolean;
}

