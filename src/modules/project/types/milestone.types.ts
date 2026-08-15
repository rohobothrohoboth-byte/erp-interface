// src/modules/project/types/milestone.types.ts
export interface ProjectMilestone {
    id: string;
    title: string;
    description: string;
    projectId: string;
    projectName: string;
    phaseId: string | null;
    phaseName: string | null;
    dueDate: string;
    actualDate: string | null;
    isCompleted: boolean;
    completedAt: string | null;
    completedByName: string;
    completionPercentage: number;
    createdAt: string;
    createdBy: string;
    isOverdue: boolean;
}

export interface MilestoneCreateDto {
    title: string;
    description?: string;
    projectId: string;
    phaseId?: string | null;
    dueDate: string;
    createdBy?: string;
}

export interface MilestoneUpdateDto {
    title?: string;
    description?: string;
    dueDate?: string;
    actualDate?: string | null;
    isCompleted?: boolean;
    completionPercentage?: number;
    updatedBy?: string;
}