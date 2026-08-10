// src/pages/finance/ar/components/InvoiceTable.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { InvoiceTableRow } from '@/modules/finance/pages/ar/components/InvoiceTableRow';
import type { SalesInvoice } from '@/modules/finance/pages/ar/types/invoice.types';

interface InvoiceTableProps {
    invoices: SalesInvoice[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onView: (invoice: SalesInvoice) => void;
    onPost: (invoice: SalesInvoice) => void;
    popoverOpen: string | null;
    onPopoverChange: (id: string | null) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
                                                              invoices,
                                                              currentPage,
                                                              totalPages,
                                                              itemsPerPage,
                                                              onPageChange,
                                                              onView,
                                                              onPost,
                                                              popoverOpen,
                                                              onPopoverChange,
                                                          }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    if (invoices.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">No sales invoices found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {invoices.map((invoice) => (
                        <InvoiceTableRow
                            key={invoice.id}
                            invoice={invoice}
                            onView={onView}
                            onPost={onPost}
                            popoverOpen={popoverOpen === invoice.id}
                            onPopoverChange={(open) => onPopoverChange(open ? invoice.id : null)}
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
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
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