// constants/finance/journalEntryConstants.ts

import type {JournalEntryFormData} from "@/modules/finance/types/journalEntry.types";

export const ENTRY_TYPES = [
    { value: 'General', label: 'General' },
    { value: 'Revenue', label: 'Revenue' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Asset', label: 'Asset' },
    { value: 'Liability', label: 'Liability' },
    { value: 'Equity', label: 'Equity' },
] as const;

export const STATUS_OPTIONS = [
    { value: 'All', label: 'All Status' },
    { value: 'Posted', label: 'Posted' },
    { value: 'Unposted', label: 'Unposted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Draft', label: 'Draft' },
] as const;

export const ITEMS_PER_PAGE = 10;

export const DEFAULT_FORM_DATA: JournalEntryFormData = {
    reference: '',
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    entryType: 'General',
    periodId: '',
    departmentId: '',  // Will be auto-filled
    branchId: '',      // Will be auto-filled
    employeeId: '',    // Will be auto-filled
    rowVersion: '',
    lines: [
        { accountId: '', direction: 'Debit', amount: 0, description: '' },
        { accountId: '', direction: 'Credit', amount: 0, description: '' },
    ],
};

export const MODAL_NAMES = {
    VIEW: 'view',
    EDIT: 'edit',
    ADD: 'add',
    DELETE: 'delete',
    POST: 'post',
    UNPOST: 'unpost',
    APPROVE: 'approve',
    REJECT: 'reject',
    REVERSE: 'reverse',
    SUMMARY: 'summary',
    EXPORT: 'export',
} as const;