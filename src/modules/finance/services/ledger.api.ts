import { financeApi } from './finance.api';

export interface GeneralLedgerEntry {
    date: string;
    reference?: string | null;
    description?: string | null;
    accountCode?: string | null;
    accountName?: string | null;
    debit: number;
    credit: number;
    balance: number;
}

export interface GeneralLedgerResponse {
    startDate: string;
    endDate: string;
    openingBalance: number;
    closingBalance: number;
    totalDebits: number;
    totalCredits: number;
    entries: GeneralLedgerEntry[];
}

export interface TrialBalanceLine {
    accountId: string;
    accountCode?: string | null;
    accountName?: string | null;
    accountType?: string | null;
    debit: number;
    credit: number;
    balance: number;
}

export interface TrialBalanceResponse {
    asOfDate: string;
    lines: TrialBalanceLine[];
    totalDebits: number;
    totalCredits: number;
    difference: number;
    isBalanced: boolean;
}

export const getGeneralLedger = (params: {
    startDate: string;
    endDate: string;
    accountId?: string;
    branchId?: string;
}) => financeApi.get<GeneralLedgerResponse>('/FinanceReports/GeneralLedger', { params });

export const getTrialBalance = (params: {
    asOfDate: string;
    branchId?: string;
}) => financeApi.get<TrialBalanceResponse>('/FinanceReports/TrialBalance', { params });
