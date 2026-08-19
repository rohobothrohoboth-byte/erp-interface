// src/pages/finance/ar/types/invoice.types.ts

export interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    discount?: number;
    taxRate?: number;
    periodId?: string;
}

export interface InvoiceAttachment {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadDate: string;
    uploadedBy: string;
    filePath: string;
}

export interface SalesInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerId?: string;
    customerName?: string;
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    status: 'Draft' | 'Posted' | 'Unpaid' | 'Partially_Paid' | 'Paid' | 'Cancelled';
    notes?: string;
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
    dateAdd: string;
    dateMod?: string;
    postedAt?: string;
    postedBy?: string;
    items?: InvoiceItem[];
    attachments?: InvoiceAttachment[];
    salesRep?: string;
    periodId?: string;
    periodName?: string;
}

export interface InvoiceStats {
    totalInvoices: number;
    totalAmount: number;
    draftCount: number;
    postedCount: number;
    paidCount: number;
    totalBalance: number;
    totalPaid: number;
    cancelledCount: number;
    unpaidCount: number;
    partiallyPaidCount: number;
}

export interface PostingData {
    revenueAccountId: string;
    receivableAccountId: string;
    taxAccountId: string;
    postingDate: string;
    description: string;
    createJournalEntry: boolean;
    periodId: string;
}