// src/modules/project/types/task.types.ts
import { TaskStatus, TaskPriority } from './project.enums';

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
    subTasks: ProjectTask[];
    subTaskCount: number;
    commentCount: number;
    isOverdue: boolean;
}

export interface TaskCreateDto {
    title: string;
    description?: string;
    projectId: string;
    parentTaskId?: string | null;
    phaseId?: string | null;
    startDate: string;
    dueDate?: string | null;
    priority: TaskPriority;
    estimatedHours?: number;
    estimatedCost?: number;
    assigneeId?: string | null;
    assigneeName?: string;
    reviewerId?: string | null;
    reviewerName?: string;
    tags?: string;
    createdBy?: string;
}

export interface TaskUpdateDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    estimatedHours?: number;
    actualHours?: number;
    remainingHours?: number;
    estimatedCost?: number;
    actualCost?: number;
    assigneeId?: string | null;
    assigneeName?: string;
    reviewerId?: string | null;
    reviewerName?: string;
    completionPercentage?: number;
    tags?: string;
    updatedBy?: string;
}

export interface TaskAssignmentDto {
    taskId: string;
    assigneeId: string;
    assigneeName: string;
    assignedBy?: string;
}

export interface TaskStatusUpdateDto {
    status: TaskStatus;
    notes?: string;
    updatedBy?: string;
}

export interface TaskFilterDto {
    projectId?: string;
    assigneeId?: string;
    reviewerId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDateFrom?: string;
    dueDateTo?: string;
    startDateFrom?: string;
    startDateTo?: string;
    minCompletion?: number;
    maxCompletion?: number;
    search?: string;
    page: number;
    pageSize: number;
    orderBy?: string;
    descending?: boolean;
}