// src/pages/finance/ap/components/PaymentsHeader.tsx
import React from 'react';
import { CreditCard, RefreshCw, Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

interface PaymentsHeaderProps {
    onRefresh: () => void;
    onAdd: () => void;
    isRefreshing: boolean;
}

export const PaymentsHeader: React.FC<PaymentsHeaderProps> = ({
                                                                  onRefresh,
                                                                  onAdd,
                                                                  isRefreshing,
                                                              }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                    <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AP Payment Entries</h1>
                    <p className="text-sm text-gray-500">Manage vendor payments (Accounts Payable)</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isRefreshing}
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus size={16} />
                    Record Payment
                </Button>
            </div>
        </div>
    );
};