// src/hooks/finance/queryKeys.ts

import { JournalEntryFilters } from '../../types/finance/journalEntry.types';

export const FINANCE_QUERY_KEYS = {
    // Journal Entries
    entries: (page: number, filters: JournalEntryFilters) =>
        ['journalEntries', 'list', page, filters] as const,

    entry: (id: string) => ['journalEntries', 'detail', id] as const,

    summary: (periodId?: string) =>
        ['journalEntries', 'summary', periodId] as const,

    unposted: () => ['journalEntries', 'unposted'] as const,

    byPeriod: (periodId: string) => ['journalEntries', 'byPeriod', periodId] as const,

    export: (params: any) => ['journalEntries', 'export', params] as const,

    // Reference Data
    accounts: () => ['reference', 'accounts'] as const,
    costCenters: () => ['reference', 'costCenters'] as const,
    periods: () => ['reference', 'periods'] as const,

    // Chart of Accounts
    chartOfAccounts: (filters?: any) => ['chartOfAccounts', filters] as const,

    // Cost Centers
    costCentersList: (filters?: any) => ['costCenters', filters] as const,
} as const;