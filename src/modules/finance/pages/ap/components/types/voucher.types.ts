// types/voucher.types.ts
export interface VoucherLine {
    id?: string;
    accountId: string;
    accountName?: string;
    accountCode?: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    periodId?: string;
}

export interface VoucherAttachment {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadDate: string;
    uploadedBy: string;
    filePath: string;
}

export interface Voucher {
    id: string;
    voucherNumber: string;
    voucherType: 'Payment' | 'Receipt' | 'Journal' | 'Contra' | 'Transfer';
    vendorId?: string;
    vendorName?: string;
    voucherDate: string;
    description?: string;
    totalDebit: number;
    totalCredit: number;
    status: 'Draft' | 'Pending' | 'Approved' | 'Posted' | 'Rejected' | 'Void';
    periodId?: string;
    periodName?: string;
    lines: VoucherLine[];
    attachments?: VoucherAttachment[];
    approvedBy?: string;
    approvedAt?: string;
    postedBy?: string;
    postedAt?: string;
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;

}

export interface VoucherStats {
    totalVouchers: number;
    totalAmount: number;
    draftCount: number;
    pendingCount: number;
    approvedCount: number;
    postedCount: number;
    rejectedCount: number;
    voidCount: number;
    paymentCount: number;
    receiptCount: number;
    journalCount: number;
}

export interface VoucherFormData {
    voucherType: Voucher['voucherType'];
    vendorId: string;
    voucherDate: string;
    description: string;
    periodId: string;
    lines: VoucherLine[];
}