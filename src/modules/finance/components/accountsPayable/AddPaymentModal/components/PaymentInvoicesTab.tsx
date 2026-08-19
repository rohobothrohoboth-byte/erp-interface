// src/components/finance/accountsPayable/AddPaymentModal/components/PaymentInvoicesTab.tsx

import React from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { InvoiceSelection } from '@/modules/finance/components/accountsPayable/AddPaymentModal/components/InvoiceSelection';
import { InvoiceSummaryCards } from '@/modules/finance/components/accountsPayable/AddPaymentModal/components/InvoiceSummaryCards';
import type { Invoice, InvoiceToPay, InvoiceSummary, BankAccount } from '@/modules/finance/components/accountsPayable/AddPaymentModal/types';
import { formatCurrency } from '@/modules/finance/components/accountsPayable/AddPaymentModal/utils/paymentHelpers';

interface PaymentInvoicesTabProps {
    selectedVendor: string;
    vendorsWithInvoices: any[];
    availableInvoices: Invoice[];
    selectedInvoice: string;
    onSelectedInvoiceChange: (value: string) => void;
    amountToPay: string;
    onAmountToPayChange: (value: string) => void;
    onAddInvoice: () => void;
    onRemoveInvoice: (invoiceId: string) => void;
    invoicesToPay: InvoiceToPay[];
    invoiceSummary: InvoiceSummary | null;
    totalAmount: number;
    loadingInvoices: boolean;
    selectedPeriodId: string;
    periods: any[];
    bankAccounts: BankAccount[];
    selectedBankAccount: string;
    isCashPayment: boolean;
    onBack: () => void;
    onNext: () => void;
    isNextDisabled: boolean;
}

export const PaymentInvoicesTab: React.FC<PaymentInvoicesTabProps> = ({
                                                                          selectedVendor,
                                                                          vendorsWithInvoices,
                                                                          availableInvoices,
                                                                          selectedInvoice,
                                                                          onSelectedInvoiceChange,
                                                                          amountToPay,
                                                                          onAmountToPayChange,
                                                                          onAddInvoice,
                                                                          onRemoveInvoice,
                                                                          invoicesToPay,
                                                                          invoiceSummary,
                                                                          totalAmount,
                                                                          loadingInvoices,
                                                                          selectedPeriodId,
                                                                          periods,
                                                                          bankAccounts,
                                                                          selectedBankAccount,
                                                                          isCashPayment,
                                                                          onBack,
                                                                          onNext,
                                                                          isNextDisabled,
                                                                      }) => {
    const vendorName = vendorsWithInvoices.find(v => v.id === selectedVendor)?.name || 'Vendor';
    const periodName = periods.find(p => p.id === selectedPeriodId)?.name || 'N/A';
    const selectedAccount = bankAccounts.find(a => a.id === selectedBankAccount);
    const insufficientBalance = !isCashPayment && selectedAccount && totalAmount > selectedAccount.currentBalance;

    return (
        <div className="space-y-4">
            {/* Vendor info */}
            {selectedVendor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">{vendorName}</span>
                        </div>
                        <div className="text-xs text-blue-600">
                            {availableInvoices.length} invoice(s) available
                            {selectedPeriodId && (
                                <span className="ml-2">• Period: {periodName}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary cards */}
            {selectedVendor && <InvoiceSummaryCards summary={invoiceSummary} totalAmount={totalAmount} />}

            {/* Insufficient balance warning */}
            {insufficientBalance && totalAmount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                        <span className="text-red-700 font-medium">Insufficient Balance</span>
                        <span className="text-red-600">Available: <strong>{formatCurrency(selectedAccount.currentBalance)}</strong></span>
                        <span className="text-red-600">Required: <strong>{formatCurrency(totalAmount)}</strong></span>
                        <span className="text-red-700 font-medium">Shortfall: {formatCurrency(totalAmount - selectedAccount.currentBalance)}</span>
                    </div>
                </div>
            )}

            {/* Invoice selection */}
            <InvoiceSelection
                availableInvoices={availableInvoices}
                selectedInvoice={selectedInvoice}
                onSelectedInvoiceChange={onSelectedInvoiceChange}
                amountToPay={amountToPay}
                onAmountToPayChange={onAmountToPayChange}
                onAddInvoice={onAddInvoice}
                loadingInvoices={loadingInvoices}
                invoicesToPay={invoicesToPay}
                onRemoveInvoice={onRemoveInvoice}
                totalAmount={totalAmount}
            />

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="text-gray-600"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Details
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isNextDisabled}
                >
                    Next: Signature & Print
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};