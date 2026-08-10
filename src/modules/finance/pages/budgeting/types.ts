export type BudgetStats = {
  total: number;
  active: number;
  draft: number;
  approved: number;
  [key: string]: unknown;
};

export type Budget = {
  id: string;
  name: string;
  status?: string;
  [key: string]: unknown;
};
