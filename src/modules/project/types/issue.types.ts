// src/modules/project/types/issue.types.ts
import { IssueType, IssuePriority, IssueStatus } from './project.enums';

export interface ProjectIssue {
    id: string;
    title: string;
    description: string;
    projectId: string;
    projectName: string;
    type: IssueType;
    priority: IssuePriority;
    status: IssueStatus;
    reportedByName: string;
    reportedAt: string;
    assignedToName: string;
    dueDate: string | null;
    resolvedAt: string | null;
    resolvedByName: string;
    resolution: string;
    rootCause: string;
    impact: string;
    createdAt: string;
    createdBy: string;
    commentCount: number;
    isOverdue: boolean;
}

export interface IssueCreateDto {
    title: string;
    description?: string;
    projectId: string;
    type: IssueType;
    priority: IssuePriority;
    assignedToId?: string | null;
    assignedToName?: string;
    dueDate?: string | null;
    reportedByName?: string;
    createdBy?: string;
}

export interface IssueUpdateDto {
    title?: string;
    description?: string;
    type?: IssueType;
    priority?: IssuePriority;
    status?: IssueStatus;
    assignedToId?: string | null;
    assignedToName?: string;
    dueDate?: string | null;
    resolution?: string;
    rootCause?: string;
    impact?: string;
    updatedBy?: string;
}

export interface IssueSummaryDto {
    projectId: string;
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    issuesByPriority: Record<string, number>;
    issuesByStatus: Record<string, number>;
    issuesByType: Record<string, number>;
    averageResolutionTime: number;
}