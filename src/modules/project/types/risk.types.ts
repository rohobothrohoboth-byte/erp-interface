// src/modules/project/types/risk.types.ts
import { RiskImpact, RiskProbability, RiskSeverity, RiskStatus } from './project.enums';

export interface ProjectRisk {
    id: string;
    title: string;
    description: string;
    projectId: string;
    projectName: string;
    impact: RiskImpact;
    probability: RiskProbability;
    severity: RiskSeverity;
    riskScore: number;
    mitigationStrategy: string;
    contingencyPlan: string;
    status: RiskStatus;
    identifiedByName: string;
    identifiedAt: string;
    assignedToName: string;
    reviewDate: string | null;
    resolvedAt: string | null;
    resolvedByName: string;
    resolutionNotes: string;
    createdAt: string;
    createdBy: string;
    riskLevel: string;
}

export interface RiskCreateDto {
    title: string;
    description?: string;
    projectId: string;
    impact: RiskImpact;
    probability: RiskProbability;
    mitigationStrategy?: string;
    contingencyPlan?: string;
    assignedToId?: string | null;
    assignedToName?: string;
    identifiedByName?: string;
    createdBy?: string;
}

export interface RiskUpdateDto {
    title?: string;
    description?: string;
    impact?: RiskImpact;
    probability?: RiskProbability;
    mitigationStrategy?: string;
    contingencyPlan?: string;
    status?: RiskStatus;
    assignedToId?: string | null;
    assignedToName?: string;
    reviewDate?: string | null;
    resolutionNotes?: string;
    updatedBy?: string;
}

export interface RiskHeatmapDto {
    projectId: string;
    heatmapData: Record<string, Record<string, number>>;
    totalRisks: number;
    highRiskCount: number;
}

export interface RiskSummaryDto {
    projectId: string;
    totalRisks: number;
    openRisks: number;
    resolvedRisks: number;
    acceptedRisks: number;
    criticalRisks: number;
    risksByStatus: Record<string, number>;
    risksBySeverity: Record<string, number>;
    averageRiskScore: number;
}