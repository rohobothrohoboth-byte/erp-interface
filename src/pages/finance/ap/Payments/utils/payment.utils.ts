// src/pages/finance/ap/utils/payment.utils.ts

import type{ PaymentEntry, PaymentStats } from '../types/payment.types';
import { STATUS_COLORS, METHOD_COLORS } from '../constants/payment.constants';

export const formatCurrency = (amount: number): string => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const getStatusBadge = (status: string): string => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getMethodBadge = (method: string): string => {
    return METHOD_COLORS[method] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const calculateStats = (payments: PaymentEntry[]): PaymentStats => {
    return {
        total: payments.length,
        draft: payments.filter(p => p.status === 'Draft').length,
        posted: payments.filter(p => p.status === 'Posted').length,
        paid: payments.filter(p => p.status === 'Paid').length,
        cancelled: payments.filter(p => p.status === 'Cancelled').length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    };
};

export const filterPayments = (
    payments: PaymentEntry[],
    searchTerm: string,
    statusFilter: string,
    periodFilter: string
): PaymentEntry[] => {
    return payments.filter(p => {
        const matchesSearch =
            p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesPeriod = periodFilter === 'all' || p.periodId === periodFilter;
        return matchesSearch && matchesStatus && matchesPeriod;
    });
};