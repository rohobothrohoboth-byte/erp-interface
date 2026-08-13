// src/types/hr/recruit/workforcePlan.ts

export interface WorkforcePlanListDto {
  id: string;
  planCode: string;
  title: string;
  desc: string;
  department: string;
  departmentId: string;
  budgetId?: string | null;
  year: number;
  startDate: string;
  endDate: string;
  totalPositions: number;
  filledPositions: number;
  openPositions: number;
  statusStr: 'Draft' | 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Cancelled' | 'Rejected';
  requistionBy: string;
  requistionById: string;
  budget: number;
  budgetCurrency: string;
  reviewComment: string | null;
  reviewedBy: string | null;
  reviewedDate: string | null;
  createdDate: string;
  rowVersion: string;
}

export interface WorkforcePlanAddDto {
  planCode: string;
  title: string;
  desc: string;
  departmentId: string;
  year: number;
  startDate: string;
  endDate: string;
  totalPositions: number;
  budget: number;
  budgetCurrency: string;
  budgetId?: string | null; // Finance budget to encumber against
}

export interface WorkforcePlanModDto {
  id: string;
  planCode: string;
  title: string;
  desc: string;
  departmentId: string;
  year: number;
  startDate: string;
  endDate: string;
  totalPositions: number;
  budget: number;
  budgetCurrency: string;
  statusStr: 'Draft' | 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Cancelled' | 'Rejected';
  rowVersion: string;
}

export interface WorkforcePlanStatsDto {
  totalPlans: number;
  activePlans: number;
  pendingPlans: number;
  completedPlans: number;
  cancelledPlans: number;
  totalPositions: number;
  filledPositions: number;
  openPositions: number;
  totalBudget: number;
}