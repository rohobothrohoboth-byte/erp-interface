// src/types/finance/index.ts

export interface Account {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    accountType: string;
    accountSubType?: string;
    isActive: boolean;
    parentId?: string | null;
    parentName?: string | null;
    level: number;
    description?: string;
    openingBalance?: number;
    openingBalanceDate?: string;
    dateAdd: string;
    dateMod?: string | null;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    nameAm?: string;
    categoryType?: string;
    isActive: boolean;
    dateAdd: string;
    dateMod?: string | null;
}

export interface Expense {
    id: string;
    expenseDate: string;
    expenseCategoryId: string;
    categoryName?: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    status: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    employeeId?: string;
    employeeName?: string;
    dateAdd: string;
    dateMod?: string | null;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    status: string;
    notes?: string;
    customerId?: string;
    customerName?: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    employeeId?: string;
    employeeName?: string;
    lines: InvoiceLine[];
    payments: Payment[];
    dateAdd: string;
    dateMod?: string | null;
}

export interface InvoiceLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalAmount: number;
}

export interface Payment {
    id: string;
    paymentNumber: string;
    paymentDate: string;
    paymentType: string;
    paymentMethod: string;
    amount: number;
    description?: string;
    status: string;
    invoiceId?: string;
    invoiceNumber?: string;
    journalEntryId?: string;
    branchId?: string;
    branchName?: string;
    employeeId?: string;
    employeeName?: string;
    dateAdd: string;
    dateMod?: string | null;
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
    postedDate?: string;
    financialPeriodId?: string;
    financialPeriodName?: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    employeeId?: string;
    employeeName?: string;
    lines: JournalLine[];
    dateAdd: string;
    dateMod?: string | null;
}

export interface JournalLine {
    id: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    direction: string;
    amount: number;
    description?: string;
}

export interface Budget {
    id: string;
    name: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    lines: BudgetLine[];
    dateAdd: string;
    dateMod?: string | null;
}

export interface BudgetLine {
    id: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    description?: string;
}

export interface FinancialPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    periodType: string;
    isClosed: boolean;
    closedDate?: string;
    dateAdd: string;
    dateMod?: string | null;
}