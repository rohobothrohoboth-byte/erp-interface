// constants/finance/queryKeys.ts

export const FINANCE_QUERY_KEYS = {
    // Dashboard
    dashboard: () => ['finance', 'dashboard'] as const,

    // Accounts (Chart of Accounts)
    chartOfAccounts: () => ['finance', 'chartOfAccounts'] as const,
    chartOfAccount: (id: string) => ['finance', 'chartOfAccounts', id] as const,

    // Bank Accounts
    bankAccounts: (params?: any) => ['finance', 'bankAccounts', params] as const,
    bankAccount: (id: string) => ['finance', 'bankAccounts', id] as const,
    bankAccountBalance: (id: string, params?: any) => ['finance', 'bankAccounts', id, 'balance', params] as const,
    bankAccountSummary: (id: string, params?: any) => ['finance', 'bankAccounts', id, 'summary', params] as const,

    // Bank Transactions
    bankTransactions: (params?: any) => ['finance', 'bankTransactions', params] as const,
    bankTransaction: (id: string) => ['finance', 'bankTransactions', id] as const,
    bankTransactionStats: (params?: any) => ['finance', 'bankTransactions', 'stats', params] as const,
    bankTransactionReconciliation: (params?: any) => ['finance', 'bankTransactions', 'reconciliation', params] as const,

    // Invoices
    invoices: (params?: any) => ['finance', 'invoices', params] as const,
    invoice: (id: string) => ['finance', 'invoices', id] as const,

    // Payments
    payments: (params?: any) => ['finance', 'payments', params] as const,
    payment: (id: string) => ['finance', 'payments', id] as const,

    // Expenses
    expenses: (params?: any) => ['finance', 'expenses', params] as const,
    expense: (id: string) => ['finance', 'expenses', id] as const,

    // Budgets
    budgets: (params?: any) => ['finance', 'budgets', params] as const,
    budget: (id: string) => ['finance', 'budgets', id] as const,

    // Journal Entries
    journalEntries: (params?: any) => ['finance', 'journalEntries', params] as const,
    journalEntry: (id: string) => ['finance', 'journalEntries', id] as const,

    // Reference Data
    branches: () => ['finance', 'branches'] as const,
    employees: () => ['finance', 'employees'] as const,
    departments: () => ['finance', 'departments'] as const,
    positions: () => ['finance', 'positions'] as const,

    // Tax
    taxReturns: (params?: any) => ['finance', 'taxReturns', params] as const,

    // Assets
    assets: (params?: any) => ['finance', 'assets', params] as const,

    // Audit Logs
    auditLogs: (params?: any) => ['finance', 'auditLogs', params] as const,

    // ✅ Analytics - FIXED: Include filter parameters in query keys
    analyticsDashboard: (params?: { periodStart?: string; periodEnd?: string; periodType?: string; fiscalYear?: string }) =>
        ['finance', 'analytics', 'dashboard', params?.periodStart, params?.periodEnd, params?.periodType, params?.fiscalYear] as const,

    analyticsRevenueTrend: (months?: number, endDate?: string) =>
        ['finance', 'analytics', 'revenue', months, endDate] as const,

    analyticsAging: (asOfDate?: string) =>
        ['finance', 'analytics', 'aging', asOfDate] as const,

    analyticsPayment: (params?: { periodStart?: string; periodEnd?: string }) =>
        ['finance', 'analytics', 'payment', params?.periodStart, params?.periodEnd] as const,

    analyticsExpense: (params?: { periodStart?: string; periodEnd?: string }) =>
        ['finance', 'analytics', 'expense', params?.periodStart, params?.periodEnd] as const,

    analyticsBudget: (params?: { periodStart?: string; periodEnd?: string }) =>
        ['finance', 'analytics', 'budget', params?.periodStart, params?.periodEnd] as const,

    // Cost Centers
    costCenters: (params?: any) => ['finance', 'costCenters', params] as const,
    costCenter: (id: string) => ['finance', 'costCenters', id] as const,

    // Financial Periods
    financialPeriods: (params?: any) => ['finance', 'financialPeriods', params] as const,
    financialPeriod: (id: string) => ['finance', 'financialPeriods', id] as const,

    // Vendors
    vendors: (params?: any) => ['finance', 'vendors', params] as const,
    vendor: (id: string) => ['finance', 'vendors', id] as const,

    // Customers
    customers: (params?: any) => ['finance', 'customers', params] as const,
    customer: (id: string) => ['finance', 'customers', id] as const,
};