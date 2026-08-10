// src/components/finance/accountsPayable/AddPaymentModal/components/PaymentHeader.tsx

import React from 'react';
import { Receipt } from 'lucide-react';
import type { PaymentMethod } from '@/modules/finance/components/accountsPayable/AddPaymentModal/types';
import { getPaymentMethodIcon, getPaymentMethodDisplay } from '@/modules/finance/components/accountsPayable/AddPaymentModal/utils/paymentHelpers';

interface PaymentHeaderProps {
    paymentMethod: PaymentMethod;
    isCashPayment: boolean;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({ paymentMethod, isCashPayment }) => {
    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Record AP Payment</h2>
                        <p className="text-sm text-gray-500">Create vendor payment transactions</p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-sm ${
                    isCashPayment
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                    {getPaymentMethodIcon(paymentMethod)}
                    <span className="font-medium">{getPaymentMethodDisplay(paymentMethod)}</span>
                </div>
            </div>
        </div>
    );
};