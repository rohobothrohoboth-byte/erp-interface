// src/pages/finance/ap/types/payment.types.ts

export interface PaymentEntry {
    id: string;
    paymentNumber: string;
    vendorId: string;
    vendorName: string;
    paymentDate: string;
    paymentMethod: 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';
    bankAccountId: string;
    bankAccountName: string;
    amount: number;
    reference?: string;
    description?: string;
    status: 'Draft' | 'Posted' | 'Cancelled' | 'Partially_Paid' | 'Paid';
    dateAdd: string;
    invoiceId?: string;
    invoiceNumber?: string;
    invoiceVendorId?: string;
    paymentType?: 'Purchase' | 'Sales';
    periodId?: string;
    periodName?: string;
}

export interface PaymentStats {
    total: number;
    draft: number;
    posted: number;
    paid: number;
    cancelled: number;
    totalAmount: number;
}

export interface AvailableInvoice {
    id: string;
    invoice_no: string;
    vendor_id: string;
    vendor_name: string;
    total_amount: number;
    remaining_amount: number;
    invoice_date: string;
    status: string;
    due_date: string;
    periodId: string;
    periodName: string;
}