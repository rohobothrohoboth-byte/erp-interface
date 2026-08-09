// src/pages/finance/ap/invoice/types/invoice.types.ts

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

export interface InvoiceAmendment {
    id: string;
    invoiceId: string;
    reason: string;
    originalSubTotal: number;
    originalTaxAmount: number;
    originalTotalAmount: number;
    requestedSubTotal: number;
    requestedTaxAmount: number;
    requestedTotalAmount: number;
    comment?: string;
    status: 'Pending_Approval' | 'Approved' | 'Rejected';
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceType: 'Purchase' | 'Sales';
    vendorId?: string;
    vendorName?: string;
    periodId?: string;
    periodName?: string;
    customerId?: string;
    customerName?: string;
    invoiceDate: string;
    dueDate: string;
    items: InvoiceItem[];
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    status: 'Draft' | 'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'Partially_Paid';
    notes?: string;
    dateAdd: string;
    rowVersion?: string;
    amendments?: InvoiceAmendment[];
    attachments?: InvoiceAttachment[];
    salesRep?: string;
    deliveryDate?: string;
    purchaseOrderId?: string;
    receivedDate?: string;
}

export interface InvoiceStats {
    totalInvoices: number;
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    draftCount: number;
    pendingCount: number;
    approvedCount: number;
    paidCount: number;
    partiallyPaidCount: number;
    rejectedCount: number;
    purchaseCount: number;
    salesCount: number;
}

export interface InvoiceFormData {
    invoiceType: 'Purchase' | 'Sales';
    vendorId: string;
    customerId: string;
    periodId: string;
    invoiceDate: string;
    dueDate: string;
    items: InvoiceItem[];
    notes: string;
    status: Invoice['status'];
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    rowVersion: string;
    manualSubTotal: number;
    salesRep: string;
    deliveryDate: string;
    purchaseOrderId: string;
    receivedDate: string;
}