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
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
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
  openingDebit?: number;
  openingCredit?: number;
  closingDebit?: number;
  closingCredit?: number;
}

export interface LedgerFilters {
  periodId?: string;
  accountId?: string;
  branchId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

type BackendGeneralLedgerEntry = {
  date: string;
  reference: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
};

type BackendGeneralLedgerResponse = {
  entries: BackendGeneralLedgerEntry[];
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
};

type BackendTrialBalanceLine = {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
};

type BackendTrialBalanceResponse = {
  lines: BackendTrialBalanceLine[];
  totalOpeningDebit: number;
  totalOpeningCredit: number;
  totalDebits: number;
  totalCredits: number;
  totalClosingDebit: number;
  totalClosingCredit: number;
  difference: number;
  isBalanced: boolean;
};

const normalizeDateParams = (filters: LedgerFilters) => ({
  startDate: filters.fromDate,
  endDate: filters.toDate,
  periodId: filters.periodId,
  accountId: filters.accountId,
  branchId: filters.branchId,
});

export const getGeneralLedgerEntries = async (
  filters: LedgerFilters = {},
): Promise<GeneralLedgerResponse> => {
  const response = await financeApi.get<BackendGeneralLedgerResponse>('/FinanceReports/GeneralLedger', {
    params: normalizeDateParams(filters),
  });

  const payload = response.data;
  const allEntries = (payload.entries ?? []).map((entry, index) => ({
    lineId: `${entry.reference}-${entry.accountCode}-${index}`,
    journalEntryId: entry.reference,
    accountId: entry.accountCode,
    accountCode: entry.accountCode,
    accountName: entry.accountName,
    journalReference: entry.reference,
    entryDate: entry.date,
    entryType: 'Journal',
    description: entry.description,
    debit: Number(entry.debit ?? 0),
    credit: Number(entry.credit ?? 0),
    movement: Number(entry.debit ?? 0) - Number(entry.credit ?? 0),
    runningBalance: Number(entry.balance ?? 0),
  }));

  const pageSize = Math.max(filters.pageSize ?? 50, 1);
  const page = Math.max(filters.page ?? 1, 1);
  const totalCount = allEntries.length;
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const start = (page - 1) * pageSize;

  return {
    success: true,
    data: allEntries.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount,
    totalPages,
    openingBalance: Number(payload.openingBalance ?? 0),
    closingBalance: Number(payload.closingBalance ?? 0),
    totalDebits: Number(payload.totalDebits ?? 0),
    totalCredits: Number(payload.totalCredits ?? 0),
  };
};

export const getTrialBalance = async (
  filters: Pick<LedgerFilters, 'periodId' | 'branchId' | 'fromDate' | 'toDate'> = {},
): Promise<TrialBalanceResponse> => {
  const response = await financeApi.get<BackendTrialBalanceResponse>('/FinanceReports/TrialBalance', {
    params: {
      startDate: filters.fromDate,
      endDate: filters.toDate,
      periodId: filters.periodId,
      branchId: filters.branchId,
    },
  });

  const payload = response.data;

  return {
    success: true,
    data: (payload.lines ?? []).map((line) => ({
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountName: line.accountName,
      accountType: line.accountType,
      debit: Number(line.debit ?? 0),
      credit: Number(line.credit ?? 0),
      balance: Number(line.balance ?? 0),
    })),
    totalDebit: Number(payload.totalDebits ?? 0),
    totalCredit: Number(payload.totalCredits ?? 0),
    difference: Number(payload.difference ?? 0),
    isBalanced: Boolean(payload.isBalanced),
    openingDebit: Number(payload.totalOpeningDebit ?? 0),
    openingCredit: Number(payload.totalOpeningCredit ?? 0),
    closingDebit: Number(payload.totalClosingDebit ?? 0),
    closingCredit: Number(payload.totalClosingCredit ?? 0),
  };
};
