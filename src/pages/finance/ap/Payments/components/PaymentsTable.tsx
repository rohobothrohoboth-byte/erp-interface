// src/pages/finance/ap/components/PaymentsTable.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, CreditCard, Plus } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { PaymentsTableRow } from './PaymentsTableRow';
import type{ PaymentEntry } from '../types/payment.types';

interface PaymentsTableProps {
    payments: PaymentEntry[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onView: (payment: PaymentEntry) => void;
    onEdit: (payment: PaymentEntry) => void;
    onDelete: (payment: PaymentEntry) => void;
    onAdd: () => void;
    popoverOpen: string | null;
    onPopoverChange: (id: string | null) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
                                                                payments,
                                                                currentPage,
                                                                totalPages,
                                                                itemsPerPage,
                                                                onPageChange,
                                                                onView,
                                                                onEdit,
                                                                onDelete,
                                                                onAdd,
                                                                popoverOpen,
                                                                onPopoverChange,
                                                            }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    if (payments.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">No AP payments found</p>
                        <p className="text-sm text-gray-400">Record your first vendor payment</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAdd}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PV Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                        <PaymentsTableRow
                            key={payment.id}
                            payment={payment}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            popoverOpen={popoverOpen === payment.id}
                            onPopoverChange={(open) => onPopoverChange(open ? payment.id : null)}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, payments.length)} of {payments.length}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};