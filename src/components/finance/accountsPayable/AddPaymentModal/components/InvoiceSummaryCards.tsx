// src/components/finance/accountsPayable/AddPaymentModal/components/InvoiceSummaryCards.tsx

import React from 'react';
import type{ InvoiceSummary } from '../types';
import { formatCurrency } from '../utils/paymentHelpers';

interface InvoiceSummaryCardsProps {
    summary: InvoiceSummary | null;
    totalAmount: number;
}

export const InvoiceSummaryCards: React.FC<InvoiceSummaryCardsProps> = ({ summary, totalAmount }) => {
    if (!summary) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium uppercase">Total</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(summary.totalAmount)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium uppercase">Paid</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(summary.paidAmount)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium uppercase">Remaining</p>
                <p className={`text-lg font-bold ${summary.remainingAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {formatCurrency(summary.remainingAmount)}
                </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs text-indigo-600 font-medium uppercase">This Payment</p>
                <p className="text-lg font-bold text-indigo-700">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-gray-500">
                    New Remaining: {formatCurrency(summary.newRemaining)}
                </p>
            </div>
        </div>
    );
};