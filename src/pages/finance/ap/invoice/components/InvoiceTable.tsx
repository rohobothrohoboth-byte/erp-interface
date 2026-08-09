// src/pages/finance/ap/invoice/components/InvoiceTable.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InvoiceTableRow } from './InvoiceTableRow';
import type{ Invoice } from '../types/invoice.types';

interface InvoiceTableProps {
    invoices: Invoice[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onView: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onDelete: (invoice: Invoice) => void;
    canEdit: (invoice: Invoice) => boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
                                                              invoices,
                                                              currentPage,
                                                              totalPages,
                                                              itemsPerPage,
                                                              onPageChange,
                                                              onView,
                                                              onEdit,
                                                              onDelete,
                                                              canEdit,
                                                          }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    if (invoices.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-8 text-center text-gray-500">
                    No invoices found
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor/Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                        <InvoiceTableRow
                            key={invoice.id}
                            invoice={invoice}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            canEdit={canEdit(invoice)}
                        />
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, invoices.length)} of {invoices.length} invoices
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};