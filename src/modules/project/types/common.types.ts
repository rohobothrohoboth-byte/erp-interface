// src/modules/project/types/common.types.ts
// ============================================================
// PAGINATION & COMMON DTOs
// ============================================================

import type{
    Project,

} from './project.types';
import type{
    BudgetSummaryDto,

} from './budget.types';
import type{
    TaskStatus,

} from './project.enums';
export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// ============================================================
// DASHBOARD DTOs
// ============================================================

export interface ProjectDashboardDto {
    totalProjects: number;
    projectsByStatus: Record<number, number>;
    recentProjects: Project[];
    upcomingMilestones: MilestoneDto[];
    overdueTasks: TaskSummaryDto[];
    resourceSummary: ResourceSummaryDto;
    budgetSummary: BudgetSummaryDto;
}

export interface MilestoneDto {
    id: string;
    title: string;
    dueDate: string;
    projectId: string;
    projectName: string;
    isCompleted: boolean;
    status: string;
}

export interface TaskSummaryDto {
    id: string;
    title: string;
    dueDate: string;
    projectId: string;
    projectName: string;
    assigneeName: string;
    status: TaskStatus;
}

export interface ResourceSummaryDto {
    totalResources: number;
    availableResources: number;
    allocatedResources: number;
    overAllocatedResources: number;
    resourcesByType: Record<string, number>;
}

export interface ProjectStatisticsDto {
    projectId: string;
    projectName: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalResources: number;
    allocatedResources: number;
    totalBudget: number;
    actualCost: number;
    budgetUtilization: number;
    tasksByStatus: Record<string, number>;
    risksByStatus: Record<string, number>;
    issuesByStatus: Record<string, number>;
}

export interface ProjectGanttDto {
    projectId: string;
    projectName: string;
    startDate: string;
    endDate: string;
    tasks: GanttTaskDto[];
}

export interface GanttTaskDto {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    completion: number;
    priority: string;
    status: string;
    assignee: string;
    parentId: string | null;
    order: number;
    color: string | null;
}

export interface ProjectTimelineDto {
    projectId: string;
    projectName: string;
    milestones: TimelineMilestoneDto[];
    events: TimelineEventDto[];
}

export interface TimelineMilestoneDto {
    id: string;
    title: string;
    date: string;
    isCompleted: boolean;
    phaseName: string;
    type: string;
}

export interface TimelineEventDto {
    id: string;
    title: string;
    description: string;
    date: string;
    eventType: string;
    userName: string;
    color: string;
}