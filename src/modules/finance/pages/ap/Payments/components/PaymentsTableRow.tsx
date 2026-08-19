// src/pages/finance/ap/components/PaymentsTableRow.tsx
import React from 'react';
import { Building2, MoreVertical, FileText, PenBox, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import type { PaymentEntry } from '@/modules/finance/pages/ap/Payments/types/payment.types';
import { formatCurrency, formatDate, getStatusBadge, getMethodBadge } from '@/modules/finance/pages/ap/Payments/utils/payment.utils';

interface PaymentsTableRowProps {
    payment: PaymentEntry;
    onView: (payment: PaymentEntry) => void;
    onEdit: (payment: PaymentEntry) => void;
    onDelete: (payment: PaymentEntry) => void;
    popoverOpen: boolean;
    onPopoverChange: (open: boolean) => void;
}

export const PaymentsTableRow: React.FC<PaymentsTableRowProps> = ({
                                                                      payment,
                                                                      onView,
                                                                      onEdit,
                                                                      onDelete,
                                                                      popoverOpen,
                                                                      onPopoverChange,
                                                                  }) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Draft': return '⏳';
            case 'Posted': return '✅';
            case 'Paid': return '✅';
            case 'Cancelled': return '❌';
            case 'Partially_Paid': return '⏳';
            default: return '⏳';
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 font-medium text-xs">
                            {payment.paymentNumber.split('-').pop()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{payment.paymentNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(payment.dateAdd)}</p>
                        {payment.periodName && (
                            <Badge variant="outline" className="text-[10px] mt-0.5">
                                {payment.periodName}
                            </Badge>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{payment.vendorName}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                {payment.invoiceNumber ? (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {payment.invoiceNumber}
                    </Badge>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">{payment.reference || '-'}</td>
            <td className="px-4 py-3">
                <Badge className={getMethodBadge(payment.paymentMethod)}>
                    {payment.paymentMethod.replace('_', ' ')}
                </Badge>
            </td>
            <td className="px-4 py-3 text-sm font-bold text-indigo-600 text-right">
                {formatCurrency(payment.amount)}
            </td>
            <td className="px-4 py-3">
                <Badge className={`flex items-center gap-1 ${getStatusBadge(payment.status)}`}>
                    <span>{getStatusIcon(payment.status)}</span>
                    {payment.status.replace('_', ' ')}
                </Badge>
            </td>
            <td className="px-4 py-3 text-center">
                <Popover open={popoverOpen} onOpenChange={onPopoverChange}>
                    <PopoverTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                            <MoreVertical size={18} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                        <div className="py-1">
                            <button
                                onClick={() => onView(payment)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                            >
                                <FileText size={16} className="text-blue-500" />
                                View Details
                            </button>
                            {payment.status === 'Draft' && (
                                <>
                                    <button
                                        onClick={() => onEdit(payment)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                                    >
                                        <PenBox size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(payment)}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </td>
        </tr>
    );
};