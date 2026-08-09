// src/components/finance/accountsPayable/AddPaymentModal/types.ts

export interface Invoice {
    id: string;
    invoice_no: string;
    vendor_id: string;
    vendor_name: string;
    total_amount: number;
    remaining_amount: number;
    paid_amount: number;
    invoice_date: string;
    status: string;
    periodId?: string;
    periodName?: string;
}

export interface InvoiceToPay {
    invoice_id: string;
    invoice_no: string;
    amount_paid: number;
    periodId?: string;
}

export interface InvoiceSummary {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    currentPaymentAmount: number;
    newTotalPaid: number;
    newRemaining: number;
}

export interface BankAccount {
    id: string;
    name: string;
    accountNumber: string;
    accountType: string;
    glCode: string;
    currentBalance: number;
    bankName: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface VendorWithInvoices {
    id: string;
    name: string;
    totalRemaining: number;
    invoiceCount: number;
}

export type PaymentMethod = 'Cash' | 'Bank_Transfer' | 'Check' | 'Telebirr';

export interface PaymentFormData {
    externalBankRef: string;
    vendorId: string;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    bankAccountId: string;
    description: string;
    periodId: string;
    requireSignature: boolean;
    receiverName: string;
    authorizedBy: string;
    invoicesToPay: InvoiceToPay[];
}

export interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    availableInvoices?: Invoice[];
    vendors?: any[];
    periods?: any[];
    selectedPeriodId?: string;
}