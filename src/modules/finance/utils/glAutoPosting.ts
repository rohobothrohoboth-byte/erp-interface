// Automatic GL Posting Utilities for AP/AR Integration
import type { JournalEntryWithLines, UUID } from '@/modules/finance/types/generalLedger';
import type { PaymentReceipt, SalesInvoice } from '@/modules/finance/components/accountsReceivable/types';
import type { PaymentEntry } from '@/modules/finance/components/accountsPayable/types';

/**
 * Create automatic journal entry when AR invoice is posted
 */
export const createARInvoiceJournal = (invoice: SalesInvoice): JournalEntryWithLines => {
  const journalId = `JE-AR-INV-${Date.now()}` as UUID;
  
  return {
    id: journalId,
    entryNumber: `JE-AR-${invoice.invoice_no}`,
    entryDate: invoice.invoice_date,
    postingDate: invoice.posted_at || new Date().toISOString(),
    description: `AR Invoice - ${invoice.customer_name}`,
    reference: invoice.invoice_no,
    sourceModule: 'AR',
    sourceReference: `Invoice-${invoice.invoice_no}`,
    fiscalYear: new Date(invoice.invoice_date).getFullYear().toString(),
    period: new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'long' }),
    status: 'Posted',
    totalDebit: invoice.total_amount,
    totalCredit: invoice.total_amount,
    isBalanced: true,
    isReversing: false,
    createdBy: invoice.posted_by || 'System',
    createdAt: new Date().toISOString(),
    postedBy: invoice.posted_by || 'System',
    postedAt: new Date().toISOString(),
    rowVersion: 1,
    lines: [
      {
        id: `${journalId}-1` as UUID,
        journalId,
        lineNumber: 1,
        accountId: '4' as UUID, // Accounts Receivable
        accountCode: '1120',
        accountName: 'Accounts Receivable',
        debit: invoice.total_amount,
        credit: 0,
        memo: `Dr. Accounts Receivable - ${invoice.customer_name}`,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
      },
      {
        id: `${journalId}-2` as UUID,
        journalId,
        lineNumber: 2,
        accountId: '9' as UUID, // Revenue
        accountCode: '4000',
        accountName: 'Revenue',
        debit: 0,
        credit: invoice.total_amount,
        memo: `Cr. Revenue - ${invoice.customer_name}`,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
      },
    ],
  };
};

/**
 * Create automatic journal entry when AR payment is received
 */
export const createARPaymentJournal = (payment: PaymentReceipt): JournalEntryWithLines => {
  const journalId = `JE-AR-PMT-${Date.now()}` as UUID;
  
  return {
    id: journalId,
    entryNumber: `JE-AR-REC-${payment.receipt_id}`,
    entryDate: payment.receipt_date,
    postingDate: new Date().toISOString(),
    description: `AR Payment Receipt - ${payment.customer_name}`,
    reference: payment.receipt_id,
    sourceModule: 'AR',
    sourceReference: `Receipt-${payment.receipt_id}`,
    fiscalYear: new Date(payment.receipt_date).getFullYear().toString(),
    period: new Date(payment.receipt_date).toLocaleDateString('en-US', { month: 'long' }),
    status: 'Posted',
    totalDebit: payment.total_received,
    totalCredit: payment.total_received,
    isBalanced: true,
    isReversing: false,
    createdBy: payment.created_by,
    createdAt: new Date().toISOString(),
    postedBy: payment.created_by,
    postedAt: new Date().toISOString(),
    rowVersion: 1,
    lines: [
      {
        id: `${journalId}-1` as UUID,
        journalId,
        lineNumber: 1,
        accountId: '3' as UUID, // Cash/Bank
        accountCode: payment.bank_gl_account || '1110',
        accountName: payment.bank_account_name || 'Cash and Bank',
        debit: payment.total_received,
        credit: 0,
        memo: `Dr. ${payment.bank_account_name} - ${payment.customer_name}`,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
      },
      {
        id: `${journalId}-2` as UUID,
        journalId,
        lineNumber: 2,
        accountId: '4' as UUID, // Accounts Receivable
        accountCode: '1120',
        accountName: 'Accounts Receivable',
        debit: 0,
        credit: payment.total_received,
        memo: `Cr. Accounts Receivable - ${payment.customer_name}`,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
      },
    ],
  };
};

/**
 * Create automatic journal entry when AP payment is made
 */
export const createAPPaymentJournal = (payment: PaymentEntry): JournalEntryWithLines => {
  const journalId = `JE-AP-PMT-${Date.now()}` as UUID;
  
  return {
    id: journalId,
    entryNumber: `JE-AP-${payment.internal_pv_no}`,
    entryDate: payment.payment_date,
    postingDate: new Date().toISOString(),
    description: `AP Payment - ${payment.vendor_name}`,
    reference: payment.internal_pv_no,
    sourceModule: 'AP',
    sourceReference: `Payment-${payment.internal_pv_no}`,
    fiscalYear: new Date(payment.payment_date).getFullYear().toString(),
    period: new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long' }),
    status: 'Posted',
    totalDebit: payment.total_amount,
    totalCredit: payment.total_amount,
    isBalanced: true,
    isReversing: false,
    createdBy: payment.created_by,
    createdAt: new Date().toISOString(),
    postedBy: payment.created_by,
    postedAt: new Date().toISOString(),
    rowVersion: 1,
    lines: [
      {
        id: `${journalId}-1` as UUID,
        journalId,
        lineNumber: 1,
        accountId: '7' as UUID, // Accounts Payable
        accountCode: '2110',
        accountName: 'Accounts Payable',
        debit: payment.total_amount,
        credit: 0,
        memo: `Dr. Accounts Payable - ${payment.vendor_name}`,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
      },
      {
        id: `${journalId}-2` as UUID,
        journalId,
        lineNumber: 2,
        accountId: '3' as UUID, // Cash/Bank
        accountCode: '1110',
        accountName: payment.bank_account_name || 'Cash and Bank',
        debit: 0,
        credit: payment.total_amount,
        memo: `Cr. ${payment.bank_account_name} - ${payment.vendor_name}`,
        createdAt: new Date().toISOString(),
        rowVersion: 1,
      },
    ],
  };
};

/**
 * Post journal entry to GL and update account balances
 */
export const postJournalToGL = (journal: JournalEntryWithLines): void => {
  // Save journal entry
  const existingJournals = JSON.parse(localStorage.getItem('journalEntries') || '[]');
  existingJournals.push(journal);
  localStorage.setItem('journalEntries', JSON.stringify(existingJournals));
  
  // Update account ledgers
  const accountLedgers = JSON.parse(localStorage.getItem('accountLedgers') || '{}');
  
  journal.lines.forEach((line) => {
    if (!accountLedgers[line.accountCode]) {
      accountLedgers[line.accountCode] = [];
    }
    
    // Calculate running balance
    const previousTransactions = accountLedgers[line.accountCode];
    const previousBalance = previousTransactions.length > 0 
      ? previousTransactions[previousTransactions.length - 1].balance 
      : 0;
    
    // Debit decreases balance (subtract), Credit increases balance (add)
    const newBalance = previousBalance - line.debit + line.credit;
    
    accountLedgers[line.accountCode].push({
      id: `${line.id}-ledger`,
      date: journal.entryDate,
      description: line.memo,
      postReference: journal.entryNumber,
      journalId: journal.id,
      debit: line.debit,
      credit: line.credit,
      balance: newBalance,
      balanceType: newBalance >= 0 ? 'Credit' : 'Debit',
      createdAt: new Date().toISOString(),
    });
  });
  
  localStorage.setItem('accountLedgers', JSON.stringify(accountLedgers));
  
  // Update account balances in Chart of Accounts
  updateAccountBalances(journal.lines);
};

/**
 * Update account balances in Chart of Accounts
 */
const updateAccountBalances = (lines: any[]): void => {
  const accounts = JSON.parse(localStorage.getItem('chartOfAccounts') || '[]');
  
  lines.forEach((line) => {
    const account = accounts.find((acc: any) => acc.code === line.accountCode);
    if (account) {
      account.debitBalance += line.debit;
      account.creditBalance += line.credit;
      account.balance = account.debitBalance - account.creditBalance;
    }
  });
  
  localStorage.setItem('chartOfAccounts', JSON.stringify(accounts));
};

/**
 * Get account ledger transactions
 */
export const getAccountLedger = (accountCode: string): any[] => {
  const accountLedgers = JSON.parse(localStorage.getItem('accountLedgers') || '{}');
  
  // If no data exists, create sample data for testing
  if (Object.keys(accountLedgers).length === 0) {
    createSampleLedgerData();
    return JSON.parse(localStorage.getItem('accountLedgers') || '{}')[accountCode] || [];
  }
  
  return accountLedgers[accountCode] || [];
};

/**
 * Create sample ledger data for testing
 */
const createSampleLedgerData = (): void => {
  const sampleLedgers: any = {
    '1120': [ // Accounts Receivable
      {
        id: 'ledger-1',
        date: '2024-01-01',
        description: 'Cr. Opening Balance - Accounts Receivable',
        postReference: 'JE-OB-001',
        journalId: 'ob-1',
        debit: 0,
        credit: 200000,
        balance: 200000, // Opening credit balance
        balanceType: 'Credit',
        createdAt: '2024-01-01T00:00:00',
      },
      {
        id: 'ledger-2',
        date: '2024-01-15',
        description: 'Cr. Accounts Receivable - ABC Company Invoice',
        postReference: 'JE-AR-001',
        journalId: '1',
        debit: 0,
        credit: 100000,
        balance: 300000, // 200000 + 100000
        balanceType: 'Credit',
        createdAt: '2024-01-15T10:00:00',
      },
      {
        id: 'ledger-3',
        date: '2024-01-16',
        description: 'Cr. Accounts Receivable - XYZ Ltd Invoice',
        postReference: 'JE-AR-002',
        journalId: '2',
        debit: 0,
        credit: 150000,
        balance: 450000, // 300000 + 150000
        balanceType: 'Credit',
        createdAt: '2024-01-16T11:00:00',
      },
      {
        id: 'ledger-4',
        date: '2024-01-17',
        description: 'Dr. Accounts Receivable - Payment from ABC Company',
        postReference: 'JE-AR-003',
        journalId: '3',
        debit: 50000,
        credit: 0,
        balance: 400000, // 450000 - 50000
        balanceType: 'Credit',
        createdAt: '2024-01-17T14:30:00',
      },
      {
        id: 'ledger-5',
        date: '2024-01-18',
        description: 'Cr. Accounts Receivable - DEF Corporation Invoice',
        postReference: 'JE-AR-004',
        journalId: '4',
        debit: 0,
        credit: 80000,
        balance: 480000, // 400000 + 80000
        balanceType: 'Credit',
        createdAt: '2024-01-18T09:15:00',
      },
      {
        id: 'ledger-6',
        date: '2024-01-19',
        description: 'Dr. Accounts Receivable - Payment from XYZ Ltd',
        postReference: 'JE-AR-005',
        journalId: '5',
        debit: 75000,
        credit: 0,
        balance: 405000, // 480000 - 75000
        balanceType: 'Credit',
        createdAt: '2024-01-19T16:45:00',
      },
    ],
    '1110': [ // Cash and Bank
      {
        id: 'ledger-7',
        date: '2024-01-01',
        description: 'Cr. Opening Balance - Cash and Bank',
        postReference: 'JE-OB-002',
        journalId: 'ob-2',
        debit: 0,
        credit: 150000,
        balance: 150000, // Opening credit balance
        balanceType: 'Credit',
        createdAt: '2024-01-01T00:00:00',
      },
      {
        id: 'ledger-8',
        date: '2024-01-17',
        description: 'Cr. Cash - Payment received from ABC Company',
        postReference: 'JE-AR-003',
        journalId: '3',
        debit: 0,
        credit: 50000,
        balance: 200000, // 150000 + 50000
        balanceType: 'Credit',
        createdAt: '2024-01-17T14:30:00',
      },
      {
        id: 'ledger-9',
        date: '2024-01-18',
        description: 'Dr. Cash - Payment to supplier',
        postReference: 'JE-AP-001',
        journalId: '7',
        debit: 25000,
        credit: 0,
        balance: 175000, // 200000 - 25000
        balanceType: 'Credit',
        createdAt: '2024-01-18T11:00:00',
      },
      {
        id: 'ledger-10',
        date: '2024-01-19',
        description: 'Cr. Cash - Payment received from XYZ Ltd',
        postReference: 'JE-AR-005',
        journalId: '5',
        debit: 0,
        credit: 75000,
        balance: 250000, // 175000 + 75000
        balanceType: 'Credit',
        createdAt: '2024-01-19T16:45:00',
      },
    ],
    '2110': [ // Accounts Payable
      {
        id: 'ledger-11',
        date: '2024-01-01',
        description: 'Cr. Opening Balance - Accounts Payable',
        postReference: 'JE-OB-003',
        journalId: 'ob-3',
        debit: 0,
        credit: 180000,
        balance: 180000, // Opening credit balance
        balanceType: 'Credit',
        createdAt: '2024-01-01T00:00:00',
      },
      {
        id: 'ledger-12',
        date: '2024-01-16',
        description: 'Cr. Accounts Payable - Invoice from Supplier A',
        postReference: 'JE-AP-002',
        journalId: '8',
        debit: 0,
        credit: 120000,
        balance: 300000, // 180000 + 120000
        balanceType: 'Credit',
        createdAt: '2024-01-16T13:00:00',
      },
      {
        id: 'ledger-13',
        date: '2024-01-18',
        description: 'Dr. Accounts Payable - Payment to supplier',
        postReference: 'JE-AP-001',
        journalId: '7',
        debit: 25000,
        credit: 0,
        balance: 275000, // 300000 - 25000
        balanceType: 'Credit',
        createdAt: '2024-01-18T11:00:00',
      },
      {
        id: 'ledger-14',
        date: '2024-01-21',
        description: 'Cr. Accounts Payable - Invoice from Supplier B',
        postReference: 'JE-AP-003',
        journalId: '9',
        debit: 0,
        credit: 95000,
        balance: 370000, // 275000 + 95000
        balanceType: 'Credit',
        createdAt: '2024-01-21T15:30:00',
      },
    ],
    '4000': [ // Revenue
      {
        id: 'ledger-15',
        date: '2024-01-01',
        description: 'Cr. Opening Balance - Revenue',
        postReference: 'JE-OB-004',
        journalId: 'ob-4',
        debit: 0,
        credit: 500000,
        balance: 500000, // Opening credit balance
        balanceType: 'Credit',
        createdAt: '2024-01-01T00:00:00',
      },
      {
        id: 'ledger-16',
        date: '2024-01-15',
        description: 'Cr. Revenue - Sales to ABC Company',
        postReference: 'JE-AR-001',
        journalId: '1',
        debit: 0,
        credit: 100000,
        balance: 600000, // 500000 + 100000
        balanceType: 'Credit',
        createdAt: '2024-01-15T10:00:00',
      },
      {
        id: 'ledger-17',
        date: '2024-01-16',
        description: 'Cr. Revenue - Sales to XYZ Ltd',
        postReference: 'JE-AR-002',
        journalId: '2',
        debit: 0,
        credit: 150000,
        balance: 750000, // 600000 + 150000
        balanceType: 'Credit',
        createdAt: '2024-01-16T11:00:00',
      },
      {
        id: 'ledger-18',
        date: '2024-01-18',
        description: 'Cr. Revenue - Sales to DEF Corporation',
        postReference: 'JE-AR-004',
        journalId: '4',
        debit: 0,
        credit: 80000,
        balance: 830000, // 750000 + 80000
        balanceType: 'Credit',
        createdAt: '2024-01-18T09:15:00',
      },
      {
        id: 'ledger-19',
        date: '2024-01-22',
        description: 'Dr. Revenue - Sales return from ABC Company',
        postReference: 'JE-AR-007',
        journalId: '10',
        debit: 30000,
        credit: 0,
        balance: 800000, // 830000 - 30000
        balanceType: 'Credit',
        createdAt: '2024-01-22T11:30:00',
      },
    ],
  };
  
  localStorage.setItem('accountLedgers', JSON.stringify(sampleLedgers));
};

/**
 * Get all journal entries for an account
 */
export const getAccountJournals = (accountCode: string): JournalEntryWithLines[] => {
  const allJournals = JSON.parse(localStorage.getItem('journalEntries') || '[]');
  return allJournals.filter((journal: JournalEntryWithLines) =>
    journal.lines.some((line) => line.accountCode === accountCode)
  );
};
