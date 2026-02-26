export interface Budget {
  id: string;
  budgetId: string;
  title: string;
  accountId: string;
  accountName: string;
  fiscalYearId: string;
  fiscalYearName: string;
  amount: number;
  distributionFrequency: 'Monthly' | 'Quarterly' | 'Yearly';
  costCenterId: string;
  costCenterName: string;
  createdAt: string;
}
