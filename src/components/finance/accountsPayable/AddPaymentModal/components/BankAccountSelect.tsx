// src/components/finance/accountsPayable/AddPaymentModal/components/BankAccountSelect.tsx

import React from 'react';
import { RefreshCw, Wallet } from 'lucide-react';
import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { formatCurrency } from '../utils/paymentHelpers';

interface BankAccountSelectProps {
    isCashPayment: boolean;
    bankAccounts: any[];
    selectedBankAccount: string;
    onBankAccountChange: (value: string) => void;
    loadingBankAccounts: boolean;
}

export const BankAccountSelect: React.FC<BankAccountSelectProps> = ({
                                                                        isCashPayment,
                                                                        bankAccounts,
                                                                        selectedBankAccount,
                                                                        onBankAccountChange,
                                                                        loadingBankAccounts,
                                                                    }) => {
    if (isCashPayment) {
        return (
            <div className="space-y-1.5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <Wallet className="h-5 w-5" />
                        <span className="text-sm font-medium">Cash Payment</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-0.5">No bank account required for cash payments</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
                Bank Account <span className="text-red-500">*</span>
            </Label>
            {loadingBankAccounts ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading accounts...
                </div>
            ) : bankAccounts.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-700">
                    No bank accounts found. Please set up a bank account first.
                </div>
            ) : (
                <Select value={selectedBankAccount} onValueChange={onBankAccountChange}>
                    <SelectTrigger className="h-10 bg-white w-full">
                        <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                        {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                                <div className="flex items-center justify-between w-full gap-3">
                                    <span className="font-medium">{account.name}</span>
                                    <span className={`text-sm ${account.currentBalance <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatCurrency(account.currentBalance)}
                  </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};