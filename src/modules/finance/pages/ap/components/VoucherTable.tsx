// components/VoucherTable.tsx
import React from 'react';
import { Eye, Edit, Trash2, CheckCircle, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { Voucher } from '@/modules/finance/pages/ap/components/types/voucher.types';
import { formatCurrency, formatDate, getStatusColor, getTypeBadge } from '@/modules/finance/pages/ap/components/utils/voucher.utils';

interface VoucherTableProps {
    vouchers: Voucher[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onView: (voucher: Voucher) => void;
    onEdit: (voucher: Voucher) => void;
    onApprove: (voucher: Voucher) => void;
    onReject: (voucher: Voucher) => void;
    onDelete: (voucher: Voucher) => void;
}

export const VoucherTable: React.FC<VoucherTableProps> = ({
                                                              vouchers,
                                                              currentPage,
                                                              totalPages,
                                                              itemsPerPage,
                                                              onPageChange,
                                                              onView,
                                                              onEdit,
                                                              onApprove,
                                                              onReject,
                                                              onDelete,
                                                          }) => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    if (vouchers.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">No vouchers found</p>
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
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {vouchers.map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{voucher.voucherNumber}</p>
                                    {voucher.description && (
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{voucher.description}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <Badge className={getTypeBadge(voucher.voucherType)}>
                                    {voucher.voucherType}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {voucher.vendorName || '-'}
                            </td>
                            <td className="px-4 py-3">
                                {voucher.periodName && (
                                    <Badge variant="outline" className="text-xs">
                                        {voucher.periodName}
                                    </Badge>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(voucher.voucherDate)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-blue-600 text-right">
                                {formatCurrency(voucher.totalDebit)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-orange-600 text-right">
                                {formatCurrency(voucher.totalCredit)}
                            </td>
                            <td className="px-4 py-3">
                                <Badge className={getStatusColor(voucher.status)}>
                                    {voucher.status}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <button
                                        onClick={() => onView(voucher)}
                                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye size={16} className="text-blue-500" />
                                    </button>
                                    {(voucher.status === 'Draft' || voucher.status === 'Pending') && (
                                        <button
                                            onClick={() => onEdit(voucher)}
                                            className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} className="text-yellow-600" />
                                        </button>
                                    )}
                                    {voucher.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => onApprove(voucher)}
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle size={16} className="text-green-500" />
                                            </button>
                                            <button
                                                onClick={() => onReject(voucher)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Reject"
                                            >
                                                <X size={16} className="text-red-500" />
                                            </button>
                                        </>
                                    )}
                                    {voucher.status === 'Draft' && (
                                        <button
                                            onClick={() => onDelete(voucher)}
                                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, vouchers.length)} of {vouchers.length} vouchers
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};