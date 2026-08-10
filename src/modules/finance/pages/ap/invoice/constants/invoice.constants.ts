// src/pages/finance/ap/invoice/constants/invoice.constants.ts

export const INVOICE_STATUSES = {
    DRAFT: 'Draft',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PAID: 'Paid',
    PARTIALLY_PAID: 'Partially_Paid',
    REJECTED: 'Rejected'
} as const;

export const INVOICE_TYPES = {
    PURCHASE: 'Purchase',
    SALES: 'Sales'
} as const;

export const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Approved: 'bg-blue-100 text-blue-700 border-blue-200',
    Paid: 'bg-green-100 text-green-700 border-green-200',
    Partially_Paid: 'bg-orange-100 text-orange-700 border-orange-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
};

export const ITEMS_PER_PAGE = 10;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const AMENDMENT_REASONS = [
    'Error in Amount',
    'Price Adjustment',
    'Quantity Correction',
    'Tax Correction',
    'Discount Adjustment',
    'Other'
] as const;