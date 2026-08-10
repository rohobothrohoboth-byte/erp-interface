
// src/components/finance/accountsPayable/AddPaymentModal/components/InvoiceSelection.tsx

import React from 'react';
import { Plus, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { Invoice, InvoiceToPay } from '@/modules/finance/components/accountsPayable/AddPaymentModal/types';
import { formatCurrency } from '@/modules/finance/components/accountsPayable/AddPaymentModal/utils/paymentHelpers';

interface InvoiceSelectionProps {
    availableInvoices: Invoice[];
    selectedInvoice: string;
    onSelectedInvoiceChange: (value: string) => void;
    amountToPay: string;
    onAmountToPayChange: (value: string) => void;
    onAddInvoice: () => void;
    loadingInvoices: boolean;
    invoicesToPay: InvoiceToPay[];
    onRemoveInvoice: (invoiceId: string) => void;
    totalAmount: number;
}

export const InvoiceSelection: React.FC<InvoiceSelectionProps> = ({
                                                                      availableInvoices,
                                                                      selectedInvoice,
                                                                      onSelectedInvoiceChange,
                                                                      amountToPay,
                                                                      onAmountToPayChange,
                                                                      onAddInvoice,
                                                                      loadingInvoices,
                                                                      invoicesToPay,
                                                                      onRemoveInvoice,
                                                                      totalAmount,
                                                                  }) => {
    const filteredInvoices = availableInvoices.filter(
        inv => !invoicesToPay.find(i => i.invoice_id === inv.id)
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Select Invoices to Pay</h3>
                {availableInvoices.length > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {availableInvoices.length} available
          </span>
                )}
            </div>

            {loadingInvoices ? (
                <div className="text-center py-6">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Loading invoices...</p>
                </div>
            ) : availableInvoices.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CheckCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No pending invoices found for this vendor</p>
                    <p className="text-xs text-gray-400">All invoices have been fully paid</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <Select value={selectedInvoice} onValueChange={onSelectedInvoiceChange}>
                                <SelectTrigger className="h-10 bg-white w-full">
                                    <SelectValue placeholder="Select an invoice to pay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredInvoices.map(invoice => (
                                        <SelectItem key={invoice.id} value={invoice.id}>
                                            <div className="flex items-center justify-between w-full gap-3">
                                                <span className="font-medium">{invoice.invoice_no}</span>
                                                <span className="text-sm text-gray-500">
                          Remaining: {formatCurrency(invoice.remaining_amount)}
                        </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                value={amountToPay}
                                onChange={(e) => onAmountToPayChange(e.target.value)}
                                placeholder="Enter amount"
                                className="h-10 bg-white flex-1"
                            />
                            <Button
                                type="button"
                                onClick={onAddInvoice}
                                size="icon"
                                className="h-10 w-10 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {invoicesToPay.length > 0 && (
                        <SelectedInvoicesList
                            invoicesToPay={invoicesToPay}
                            onRemove={onRemoveInvoice}
                            totalAmount={totalAmount}
                        />
                    )}
                </>
            )}
        </div>
    );
};