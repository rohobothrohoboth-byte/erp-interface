export interface PaymentEntry {
  id: string;
  internal_pv_no: string;
  external_bank_ref: string;
  vendor_id: string;
  vendor_name: string;
  payment_date: string;
  payment_method: "Cash" | "Bank_Transfer" | "Check" | "Telebirr";
  bank_account_id: string;
  bank_account_name: string;
  total_amount: number;
  invoices_paid: Array<{
    invoice_id: string;
    invoice_no: string;
    amount_paid: number;
  }>;
  attachment_url?: string;
  status: "Draft" | "Posted" | "Cancelled";
  created_at: string;
  created_by: string;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  vendor_id: string;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: "Pending" | "Partially_Paid" | "Paid";
  approval_status: "Pending_Approval" | "In_Progress" | "Approved" | "Rejected";
  current_approval_step?: number;
  approval_chain_id?: string;
  approval_history: ApprovalHistoryItem[];
  description: string;
  invoice_document_url?: string; // URL to invoice document (PDF/DOC)
  created_at: string;
}

export interface ApprovalHistoryItem {
  step_order: number;
  step_name: string;
  approver_name: string;
  approver_role: string;
  action: "Approved" | "Rejected" | "Pending";
  comment?: string;
  action_date?: string;
}

export interface JournalEntry {
  id: string;
  entry_no: string;
  entry_date: string;
  description: string;
  reference_type: "Payment" | "Invoice_Approval";
  reference_id: string;
  total_debit: number;
  total_credit: number;
  status: "Draft" | "Posted";
  lines: JournalLine[];
  created_at: string;
  created_by: string;
}

export interface JournalLine {
  id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
}
