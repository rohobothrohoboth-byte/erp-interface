import { financeApi } from './finance.api';

export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  normalBalance: string;
  openingDebit: number;
  openingCredit: number;
  debit: number;
  credit: number;
  closingDebit: number;
  closingCredit: number;
  balance: number;
}

export interface TrialBalanceResponse {
  asOfDate: string;
  startDate: string;
  endDate: string;
  periodId: string;
  periodName: string;
  lines: TrialBalanceLine[];
  totalOpeningDebit: number;
  totalOpeningCredit: number;
  totalDebits: number;
  totalCredits: number;
  totalClosingDebit: number;
  totalClosingCredit: number;
  difference: number;
  isBalanced: boolean;
}

export interface GeneralLedgerEntry {
  date: string;
  reference: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerResponse {
  startDate: string;
  endDate: string;
  periodId: string;
  periodName: string;
  accountId: string;
  entries: GeneralLedgerEntry[];
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
}

export const getTrialBalance = async (periodId: string) => {
  const response = await financeApi.get<TrialBalanceResponse>('/FinanceReports/TrialBalance', {
    params: { periodId },
  });
  return response.data;
};

export const getGeneralLedger = async (periodId: string, accountId: string) => {
  const response = await financeApi.get<GeneralLedgerResponse>('/FinanceReports/GeneralLedger', {
    params: { periodId, accountId },
  });
  return response.data;
};
