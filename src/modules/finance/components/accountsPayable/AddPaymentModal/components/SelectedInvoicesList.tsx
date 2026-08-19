// src/components/finance/accountsPayable/AddPaymentModal/components/SelectedInvoicesList.tsx

import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { InvoiceToPay } from '@/modules/finance/components/accountsPayable/AddPaymentModal/types';
import { formatCurrency } from '@/modules/finance/components/accountsPayable/AddPaymentModal/utils/paymentHelpers';

interface SelectedInvoicesListProps {
    invoicesToPay: InvoiceToPay[];
    onRemove: (invoiceId: string) => void;
    totalAmount: number;
}

export const SelectedInvoicesList: React.FC<SelectedInvoicesListProps> = ({
                                                                              invoicesToPay,
                                                                              onRemove,
                                                                              totalAmount,
                                                                          }) => {
    if (invoicesToPay.length === 0) return null;

    return (
        <div className="mt-3 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Selected Invoices <span className="text-gray-400">({invoicesToPay.length})</span>
        </span>
                <span className="text-sm text-gray-600">
          Total: <span className="font-bold text-indigo-600">{formatCurrency(totalAmount)}</span>
        </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {invoicesToPay.map((invoice) => (
                    <div key={invoice.invoice_id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700 truncate">{invoice.invoice_no}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm text-gray-600 font-medium">
                {formatCurrency(invoice.amount_paid)}
              </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(invoice.invoice_id)}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};