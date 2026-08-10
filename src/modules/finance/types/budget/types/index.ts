// src/pages/finance/budget/types/index.ts

export interface BudgetLine {
    id?: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    allocatedAmount: number;
    spentAmount: number;
    description?: string;
    periodId?: string;
}

export interface Budget {
    id: string;
    name: string;
    budgetCodeId: string;
    budgetCode: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    periodId?: string;
    periodName?: string;
    lines: BudgetLine[];
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
}

export interface BudgetFormData {

    name: string;
    budgetCodeId: string;
    description: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    branchId: string;
    departmentId: string;
    periodId: string;
    status: string;
    lines: BudgetLine[];
}

export interface BudgetStats {
    total: number;
    active: number;
    draft: number;
    totalAmount: number;
}

export interface BudgetExportData {
    budgets: Budget[];
    stats: BudgetStats;
    periodName: string;
}