// constants/voucher.constants.ts
import type{ Voucher } from './types/voucher.types';

export const VOUCHER_STATUSES = {
    DRAFT: 'Draft',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    POSTED: 'Posted',
    REJECTED: 'Rejected',
    VOID: 'Void'
} as const;

export const VOUCHER_TYPES = {
    PAYMENT: 'Payment',
    RECEIPT: 'Receipt',
    JOURNAL: 'Journal',
    CONTRA: 'Contra',
    TRANSFER: 'Transfer'
} as const;

export const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Approved: 'bg-blue-100 text-blue-700 border-blue-200',
    Posted: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
    Void: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const TYPE_COLORS: Record<string, string> = {
    Payment: 'bg-red-100 text-red-700 border-red-200',
    Receipt: 'bg-green-100 text-green-700 border-green-200',
    Journal: 'bg-blue-100 text-blue-700 border-blue-200',
    Contra: 'bg-purple-100 text-purple-700 border-purple-200',
    Transfer: 'bg-orange-100 text-orange-700 border-orange-200',
};

export const ITEMS_PER_PAGE = 10;
export const DEFAULT_FORM_DATA: Partial<VoucherFormData> = {
    voucherType: 'Journal',
    voucherDate: new Date().toISOString().split('T')[0],
    lines: [{ accountId: '', description: '', debitAmount: 0, creditAmount: 0, periodId: '' }]
};