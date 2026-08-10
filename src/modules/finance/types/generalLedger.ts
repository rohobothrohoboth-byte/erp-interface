// General Ledger Types for IFRS Compliance and Ethiopian Tax Audits (ERCA)

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

// Account Types based on IFRS
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

// Account Status
export type AccountStatus = 'Active' | 'Inactive' | 'Closed';

// Journal Entry Status
export type JournalStatus = 'Draft' | 'Posted' | 'Approved' | 'Rejected' | 'Void';

// Period Status
export type PeriodStatus = 'Open' | 'Closed' | 'Locked';

// Chart of Accounts
export interface ChartOfAccount {
  id: UUID;
  code: string;
  name: string;
  nameAm?: string; // Amharic name for Ethiopian compliance
  accountType: AccountType;
  parentId?: UUID | null; // For hierarchical structure
  level: number; // 1 = parent, 2 = child, etc.
  balance: number;
  debitBalance: number;
  creditBalance: number;
  currency: string;
  status: AccountStatus;
  description?: string;
  taxCode?: string; // For ERCA compliance
  isControlAccount: boolean;
  allowManualEntry: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  rowVersion: number;
}

// Journal Entry Header
export interface JournalEntry {
  id: UUID;
  entryNumber: string; // e.g., JE-2024-001
  entryDate: string;
  postingDate?: string;
  description: string;
  reference?: string; // External reference
  sourceModule?: 'Manual' | 'AP' | 'AR' | 'Payroll' | 'Asset' | 'Bank';
  sourceReference?: string; // e.g., Invoice-INV-101, Payment-REC-505
  fiscalYear: string;
  period: string;
  status: JournalStatus;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  isReversing: boolean;
  reversingDate?: string;
  reversedEntryId?: UUID;
  attachments?: string[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  postedBy?: string;
  postedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  rowVersion: number;
}

// Journal Entry Line (Detail)
export interface JournalEntryLine {
  id: UUID;
  journalId: UUID;
  lineNumber: number;
  accountId: UUID;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
  costCenter?: string;
  department?: string;
  project?: string;
  taxCode?: string;
  taxAmount?: number;
  createdAt: string;
  rowVersion: number;
}

// Complete Journal Entry with Lines
export interface JournalEntryWithLines extends JournalEntry {
  lines: JournalEntryLine[];
}

// Audit Trail Entry
export interface AuditTrailEntry {
  id: UUID;
  entityType: 'JournalEntry' | 'Account' | 'Period';
  entityId: UUID;
  action: 'Create' | 'Update' | 'Delete' | 'Post' | 'Approve' | 'Reject' | 'Void' | 'Close' | 'Reopen';
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress?: string;
  notes?: string;
}

// Financial Period
export interface FinancialPeriod {
  id: UUID;
  fiscalYear: string;
  periodNumber: number;
  periodName: string; // e.g., "January 2024"
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  closedBy?: string;
  closedAt?: string;
  lockedBy?: string;
  lockedAt?: string;
  rowVersion: number;
}

// Account Balance Summary
export interface AccountBalance {
  accountId: UUID;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  debitMovement: number;
  creditMovement: number;
  closingBalance: number;
  period: string;
  fiscalYear: string;
}

// Trial Balance Entry
export interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

// Journal Entry Validation Result
export interface JournalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// DTOs for API
export interface CreateJournalEntryDto {
  entryDate: string;
  description: string;
  reference?: string;
  sourceModule?: string;
  sourceReference?: string;
  fiscalYear: string;
  period: string;
  notes?: string;
  lines: CreateJournalEntryLineDto[];
}

export interface CreateJournalEntryLineDto {
  accountId: UUID;
  debit: number;
  credit: number;
  memo?: string;
  costCenter?: string;
  department?: string;
}

export interface UpdateJournalEntryDto extends CreateJournalEntryDto {
  id: UUID;
  rowVersion: number;
}

export interface CreateAccountDto {
  code: string;
  name: string;
  nameAm?: string;
  accountType: AccountType;
  parentId?: UUID | null;
  description?: string;
  taxCode?: string;
  isControlAccount: boolean;
  allowManualEntry: boolean;
}

export interface UpdateAccountDto extends CreateAccountDto {
  id: UUID;
  rowVersion: number;
}
