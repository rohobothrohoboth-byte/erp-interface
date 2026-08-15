// src/modules/project/types/audit.types.ts
import { AuditAction } from './project.enums';

export interface ProjectAuditLog {
    id: string;
    projectId: string;
    projectName: string;
    action: AuditAction;
    entityType: string;
    entityId: string | null;
    entityName: string;
    actionDescription: string;
    userId: string;
    userName: string;
    userRole: string | null;
    userDepartment: string | null;
    clientIp: string | null;
    userAgent: string | null;
    createdAt: string;
    oldValues: string | null;
    newValues: string | null;
}

export interface AuditLogFilterDto {
    projectId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    pageSize: number;
    orderBy?: string;
    descending?: boolean;
}

export interface AuditLogSummaryDto {
    projectId: string;
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByUser: Record<string, number>;
    logsByEntity: Record<string, number>;
    lastActivity: string | null;
    mostActiveUser: string | null;
}