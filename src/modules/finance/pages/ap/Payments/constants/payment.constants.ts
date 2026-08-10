// src/pages/finance/ap/constants/payment.constants.ts

export const PAYMENT_STATUSES = {
    DRAFT: 'Draft',
    POSTED: 'Posted',
    CANCELLED: 'Cancelled',
    PARTIALLY_PAID: 'Partially_Paid',
    PAID: 'Paid'
} as const;

export const PAYMENT_METHODS = {
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank_Transfer',
    CHECK: 'Check',
    TELEBIRR: 'Telebirr'
} as const;

export const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Posted: 'bg-blue-100 text-blue-800 border-blue-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Partially_Paid: 'bg-orange-100 text-orange-800 border-orange-200',
    Paid: 'bg-green-100 text-green-800 border-green-200',
};

export const METHOD_COLORS: Record<string, string> = {
    Cash: 'bg-blue-100 text-blue-800 border-blue-200',
    Bank_Transfer: 'bg-purple-100 text-purple-800 border-purple-200',
    Check: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Telebirr: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const ITEMS_PER_PAGE = 10;