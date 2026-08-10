// src/components/finance/accountsPayable/types.ts

export interface PaymentEntry {
    // ✅ Match the API response structure
    id: string;
    paymentNumber: string;           // From API
    internal_pv_no: string;          // For display
    external_bank_ref: string;       // From API
    payment_date: string;            // From API
    paymentMethod: string;           // From API
    vendorName: string;              // From API
    bankAccountName: string;         // From API
    amount: number;                  // From API
    total_amount: number;            // For display
    status: string;                  // From API
    description?: string;
    reference?: string;
    invoices_paid?: Array<{
        invoice_id: string;
        invoice_no: string;
        amount_paid: number;
    }>;
    created_by?: string;
    created_at?: string;
    attachment_url?: string;
}