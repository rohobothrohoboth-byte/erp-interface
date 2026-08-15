// src/modules/project/types/budget.types.ts
import { BudgetCategory } from './project.enums';

export interface ProjectBudget {
    id: string;
    projectId: string;
    projectName: string;
    category: BudgetCategory;
    categoryName: string;
    plannedAmount: number;
    actualAmount: number;
    committedAmount: number;
    remainingAmount: number;
    plannedDate: string | null;
    actualDate: string | null;
    vendorId: string | null;
    vendorName: string;
    purchaseOrderId: string | null;
    invoiceId: string | null;
    description: string;
    isApproved: boolean;
    approvedAt: string | null;
    approvedByName: string;
    utilizationPercentage: number;
    createdAt: string;
    createdBy: string;
}

export interface BudgetCreateDto {
    projectId: string;
    category: BudgetCategory;
    categoryName?: string;
    plannedAmount: number;
    plannedDate?: string | null;
    vendorId?: string | null;
    vendorName?: string;
    description?: string;
    createdBy?: string;
}

export interface BudgetUpdateDto {
    plannedAmount?: number;
    actualAmount?: number;
    committedAmount?: number;
    plannedDate?: string | null;
    actualDate?: string | null;
    isApproved?: boolean;
    description?: string;
    updatedBy?: string;
}

export interface BudgetSummaryDto {
    projectId: string;
    projectName: string;
    totalBudget: number;
    totalActual: number;
    totalCommitted: number;
    totalRemaining: number;
    approvedBudget: number;
    pendingApproval: number;
    utilizationPercentage: number;
    budgetByCategory: Record<string, number>;
    actualByCategory: Record<string, number>;
}

export interface BudgetUtilizationDto {
    projectId: string;
    projectName: string;
    totalBudget: number;
    totalUtilized: number;
    totalCommitted: number;
    overallUtilization: number;
    monthlyData: MonthlyBudgetData[];
    categoryUtilization: CategoryUtilizationData[];
}

export interface MonthlyBudgetData {
    month: string;
    planned: number;
    actual: number;
    utilization: number;
}

export interface CategoryUtilizationData {
    category: string;
    planned: number;
    actual: number;
    utilization: number;
}