export interface SalesInvoice {
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'Draft' | 'Posted' | 'Partially_Paid' | 'Paid';
  description: string;
  created_at: string;
  posted_at?: string;
  posted_by?: string;
}

export interface PaymentReceipt {
  receipt_id: string;
  customer_id: string;
  customer_name: string;
  payment_method: 'Cash' | 'Bank_Transfer' | 'Telebirr' | 'Check';
  bank_reference: string;
  bank_gl_account: string;
  bank_account_name: string;
  total_received: number;
  allocations: PaymentAllocation[];
  attachment_url?: string;
  receipt_date: string;
  status: 'Posted';
  created_at: string;
  created_by: string;
}

export interface PaymentAllocation {
  invoice_id: string;
  invoice_no: string;
  amount_applied: number;
}

export interface JournalEntry {
  id: string;
  entry_no: string;
  entry_date: string;
  description: string;
  reference_type: 'Invoice_Posting' | 'Payment_Receipt';
  reference_id: string;
  total_debit: number;
  total_credit: number;
  status: 'Posted';
  lines: JournalLine[];
  created_at: string;
  created_by: string;
}

export interface JournalLine {
  account: string;
  account_code: string;
  debit: number;
  credit: number;
  description: string;
}
