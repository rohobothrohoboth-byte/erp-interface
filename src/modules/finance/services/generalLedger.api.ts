import { financeApi } from './finance.api';

export interface GeneralLedgerEntry {
  lineId: string;
  journalEntryId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  journalReference: string;
  entryDate: string;
  entryType: string;
  description: string;
  debit: number;
  credit: number;
  movement: number;
  runningBalance: number;
}

export interface GeneralLedgerResponse {
  success: boolean;
  data: GeneralLedgerEntry[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceResponse {
  success: boolean;
  data: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

export interface FinanceIntegrityResponse {
  success: boolean;
  postedEntries: number;
  invalidEntries: number;
  isHealthy: boolean;
  issues: Array<{
    id: string;
    reference: string;
    totalDebit: number;
    totalCredit: number;
    lineDebit: number;
    lineCredit: number;
  }>;
}

export interface LedgerFilters {
  periodId?: string;
  accountId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export const getGeneralLedgerEntries = async (
  filters: LedgerFilters = {},
): Promise<GeneralLedgerResponse> => {
  const response = await financeApi.get('/GeneralLedger/Entries', {
    params: filters,
  });
  return response.data;
};

export const getTrialBalance = async (
  filters: Pick<LedgerFilters, 'periodId' | 'fromDate' | 'toDate'> = {},
): Promise<TrialBalanceResponse> => {
  const response = await financeApi.get('/GeneralLedger/TrialBalance', {
    params: filters,
  });
  return response.data;
};

export const getFinanceIntegrity = async (
  filters: Pick<LedgerFilters, 'periodId' | 'fromDate' | 'toDate'> = {},
): Promise<FinanceIntegrityResponse> => {
  const response = await financeApi.get('/GeneralLedger/Integrity', {
    params: filters,
  });
  return response.data;
};
