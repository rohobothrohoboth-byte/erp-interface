// Master Budget - manually created by users
export interface Budget {
  id: string;
  name: string;
  fiscalYear: string;
  costCenter: string;
  description?: string;
  totalAmount: number;
  status: 'Draft' | 'Active' | 'Closed';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Budget Version - auto-created when approvals happen
export interface BudgetVersion {
  id: string;
  budgetId: string; // Links to master budget
  budgetPlanId: string;
  budgetPlanName: string;
  version: string; // V1, V2, V3, etc.
  versionType: 'Master' | 'Additional';
  fiscalYear: string;
  costCenter: string;
  totalAmount: number;
  approvedAmount: number;
  expenses: BudgetVersionExpense[];
  parentVersionId?: string; // For additional budgets, links to V1
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  status: 'Active' | 'Superseded' | 'Archived';
}

export interface BudgetVersionExpense {
  id: string;
  expenseId: string;
  budgetCode: string;
  account: string;
  budgetCategory: string;
  amount: number;
  justification: string;
  source: 'BudgetPlan' | 'AdditionalBudget';
  sourceId: string;
}
