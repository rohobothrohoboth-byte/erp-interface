// types/finance/journalEntry.types.ts

export interface JournalLine {
    id?: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    direction: 'Debit' | 'Credit';
    amount: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    reference: string;
    entryDate: string;
    description: string;
    entryType: string;
    totalDebit: number;
    totalCredit: number;
    isPosted: boolean;
    isApproved: boolean;
    isReversed: boolean;
    postedDate?: string;
    approvedDate?: string;
    approvedBy?: string;
    reversedDate?: string;
    reversedBy?: string;
    rejectionReason?: string;
    periodId?: string;
    periodName?: string;
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
    lines: JournalLine[];
    rowVersion?: string;
    dateAdd: string;
    dateMod?: string;
}

export interface JournalEntrySummary {
    totalEntries: number;
    postedEntries: number;
    unpostedEntries: number;
    approvedEntries: number;
    rejectedEntries: number;
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
    periodName?: string;
    entriesByType: Record<string, number>;
    amountByType: Record<string, number>;
}



export interface JournalEntryFormData {
    reference: string;
    entryDate: string;
    description: string;
    entryType: string;
    periodId: string;
    departmentId: string;
    branchId: string;      // ✅ Auto-filled from login
    employeeId: string;    // ✅ Auto-filled from login
    rowVersion?: string;
    lines: JournalLine[];
}

export interface JournalEntryFilterspro {
    searchTerm: string;
    filterStatus: string;
    filterType: string;
    selectedPeriod: string;
}

export type ExportFormat = 'csv' | 'json';