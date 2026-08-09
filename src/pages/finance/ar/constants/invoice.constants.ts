// src/pages/finance/ar/constants/invoice.constants.ts

export const INVOICE_STATUSES = {
    DRAFT: 'Draft',
    POSTED: 'Posted',
    UNPAID: 'Unpaid',
    PARTIALLY_PAID: 'Partially_Paid',
    PAID: 'Paid',
    CANCELLED: 'Cancelled'
} as const;

export const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Posted: 'bg-green-100 text-green-800 border-green-200',
    Unpaid: 'bg-blue-100 text-blue-800 border-blue-200',
    Partially_Paid: 'bg-orange-100 text-orange-800 border-orange-200',
    Paid: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
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