// src/components/finance/accountsPayable/AddPaymentModal/utils/paymentHelpers.ts

import React from 'react';
import { Wallet, Banknote, FileText, Phone, CreditCard } from 'lucide-react';
import type { PaymentMethod } from '../types';

export const formatCurrency = (amount: number): string => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

// ✅ Use React.createElement instead of JSX
export const getPaymentMethodIcon = (method: PaymentMethod): JSX.Element => {
    const iconProps = { className: "h-5 w-5" };
    switch (method) {
        case 'Cash':
            return React.createElement(Wallet, { ...iconProps, className: "h-5 w-5 text-emerald-500" });
        case 'Bank_Transfer':
            return React.createElement(Banknote, { ...iconProps, className: "h-5 w-5 text-blue-500" });
        case 'Check':
            return React.createElement(FileText, { ...iconProps, className: "h-5 w-5 text-purple-500" });
        case 'Telebirr':
            return React.createElement(Phone, { ...iconProps, className: "h-5 w-5 text-orange-500" });
        default:
            return React.createElement(CreditCard, { ...iconProps, className: "h-5 w-5 text-gray-500" });
    }
};

export const getPaymentMethodDisplay = (method: PaymentMethod): string => {
    return method === 'Bank_Transfer' ? 'Bank Transfer' : method;
};

export const calculateTotal = (invoicesToPay: any[]): number => {
    if (!invoicesToPay || invoicesToPay.length === 0) return 0;
    return invoicesToPay.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
};

export const isOverpaying = (invoicesToPay: any[], invoiceSummary: any | null): boolean => {
    if (!invoiceSummary) return false;
    const totalPaid = calculateTotal(invoicesToPay);
    const remaining = invoiceSummary.remainingAmount || 0;
    return totalPaid > remaining + 0.01;
};