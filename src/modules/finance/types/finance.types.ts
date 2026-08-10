// src/types/finance.types.ts

// src/types/finance/finance.types.ts

export interface FinancialPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    isClosed: boolean;
    status: 'OPEN' | 'CLOSED' | 'LOCKED' | 'PENDING' | 'DRAFT';
    closedDate?: string;
    closedBy?: string;
    dateAdd: string;
    dateMod: string;
    notes?: string;
    totalEntries?: number;
    postedEntries?: number;
    unpostedEntries?: number;
    totalTransactions?: number;
    totalDebit?: number;
    totalCredit?: number;
    daysRemaining?: number;
    completionPercentage?: number;
    canBeClosed?: boolean;
    closingReason?: string | null;
}
export interface PeriodStats {
    totalJournalEntries: number;
    postedEntries: number;
    unpostedEntries: number;
    totalTransactions: number;
    totalDebit: number;
    totalCredit: number;
    periodStart?: string;
    periodEnd?: string;
    daysRemaining: number;
    completionPercentage: number;
    canBeClosed: boolean;
    closingReason: string | null;
}

export interface AuditLog {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changes?: Record<string, { old: any; new: any }>;
    userId: string;
    userEmail?: string;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt?: string;
    status?: string;
    errorMessage?: string;
    metadata?: any;
}

interface BankTransaction {
    id: string;
    bankAccountId: string;
    bankAccountName?: string;
    transactionDate: string;
    transactionType: string;
    amount: number;
    description: string;
    reference: string;
    isReconciled: boolean;
    reconciliationDate?: string;
    dateAdd: string;
    dateMod?: string;
    periodId?: string;
    periodName?: string;
    status?: string;
    rowVersion?: string;  // ✅ Add this
}

export interface JournalEntry {
    id: string;
    entryDate: string;
    reference: string;
    description: string;
    isPosted: boolean;
    lines: JournalEntryLine[];
    totalDebit: number;
    totalCredit: number;
    createdBy: string;
    postedDate?: string;
}

export interface JournalEntryLine {
    id: string;
    accountId: string;
    accountName: string;
    debit: number;
    credit: number;
    description?: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues: any;
    newValues: any;
    changes: any;
    metadata: any;
    ipAddress: string;
    userAgent: string;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
    createdAt: string;
}

export interface PeriodClosingRequest {
    periodId: string;
    forceClose?: boolean;
    notes?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}



export interface FixedAsset {
    id: string;
    code: string;
    name: string;
    description?: string;
    category: string;
    acquisitionDate: string;
    acquisitionCost: number;
    usefulLife: number; // in years
    salvageValue: number;
    depreciationMethod: 'StraightLine' | 'DecliningBalance' | 'UnitsOfProduction' | 'SumOfYears';
    accumulatedDepreciation: number;
    bookValue: number;
    currentPeriodDepreciation: number;
    status: 'Active' | 'Disposed' | 'UnderDepreciation' | 'FullyDepreciated';
    location?: string;
    serialNumber?: string;
    assignedTo?: string;
    departmentId?: string;
    periodId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Reconciliation {
    id: string;
    bankAccountId: string;
    bankAccountName?: string;
    statementDate: string;
    statementBalance: number;
    bookBalance: number;
    difference: number;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Verified';
    matchedTransactions: number;
    unmatchedTransactions: number;
    createdBy: string;
    createdAt: string;
    completedAt?: string;
    notes?: string;
}

export interface FinancialRatio {
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changePercentage: number;
    status: 'Good' | 'Warning' | 'Critical' | 'Excellent';
    category: 'Liquidity' | 'Solvency' | 'Profitability' | 'Efficiency' | 'Market';
    formula: string;
    interpretation: string;
}

export interface CashFlowForecast {
    period: string;
    openingBalance: number;
    inflows: {
        category: string;
        amount: number;
        expectedDate: string;
        probability: number;
    }[];
    outflows: {
        category: string;
        amount: number;
        expectedDate: string;
        priority: 'High' | 'Medium' | 'Low';
    }[];
    netCashFlow: number;
    closingBalance: number;
    projectedBalance: number;
}

export interface ClosingActivity {
    id: string;
    periodId: string;
    type: 'Revaluation' | 'Depreciation' | 'Accrual' | 'Provision' | 'Adjustment';
    description: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
    startedAt: string;
    completedAt?: string;
    performedBy: string;
    affectedAccounts: string[];
    amount: number;
    notes?: string;
}

