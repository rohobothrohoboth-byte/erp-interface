// utils/voucher.utils.ts
import type{ Voucher, VoucherLine, VoucherStats } from '../types/voucher.types';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const calculateTotals = (lines: VoucherLine[]) => {
    return {
        totalDebit: lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0),
        totalCredit: lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0),
    };
};

export const isVoucherBalanced = (lines: VoucherLine[]): boolean => {
    const { totalDebit, totalCredit } = calculateTotals(lines);
    return totalDebit === totalCredit && totalDebit > 0;
};

export const calculateStats = (vouchers: Voucher[]): VoucherStats => {
    return {
        totalVouchers: vouchers.length,
        totalAmount: vouchers.reduce((sum, v) => sum + v.totalDebit, 0),
        draftCount: vouchers.filter(v => v.status === 'Draft').length,
        pendingCount: vouchers.filter(v => v.status === 'Pending').length,
        approvedCount: vouchers.filter(v => v.status === 'Approved').length,
        postedCount: vouchers.filter(v => v.status === 'Posted').length,
        rejectedCount: vouchers.filter(v => v.status === 'Rejected').length,
        voidCount: vouchers.filter(v => v.status === 'Void').length,
        paymentCount: vouchers.filter(v => v.voucherType === 'Payment').length,
        receiptCount: vouchers.filter(v => v.voucherType === 'Receipt').length,
        journalCount: vouchers.filter(v => v.voucherType === 'Journal').length,
    };
};

export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        Draft: 'bg-gray-100 text-gray-700 border-gray-200',
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Approved: 'bg-blue-100 text-blue-700 border-blue-200',
        Posted: 'bg-green-100 text-green-700 border-green-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
        Void: 'bg-gray-100 text-gray-500 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getTypeBadge = (type: string): string => {
    const colors: Record<string, string> = {
        Payment: 'bg-red-100 text-red-700 border-red-200',
        Receipt: 'bg-green-100 text-green-700 border-green-200',
        Journal: 'bg-blue-100 text-blue-700 border-blue-200',
        Contra: 'bg-purple-100 text-purple-700 border-purple-200',
        Transfer: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
};

export const filterVouchers = (
    vouchers: Voucher[],
    searchTerm: string,
    filterStatus: string,
    filterType: string
): Voucher[] => {
    return vouchers.filter(v => {
        const matchesSearch =
            v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
        const matchesType = filterType === 'All' || v.voucherType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });
};