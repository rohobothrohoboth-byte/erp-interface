// src/pages/finance/ar/components/InvoiceTableRow.tsx
import React from 'react';
import { Eye, Send, CheckCircle, MoreVertical, User } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import type { SalesInvoice } from '@/modules/finance/pages/ar/types/invoice.types';
import { formatCurrency, formatDate, getStatusBadge, getStatusIcon } from '@/modules/finance/pages/ar/utils/invoice.utils';

interface InvoiceTableRowProps {
    invoice: SalesInvoice;
    onView: (invoice: SalesInvoice) => void;
    onPost: (invoice: SalesInvoice) => void;
    popoverOpen: boolean;
    onPopoverChange: (open: boolean) => void;
}

export const InvoiceTableRow: React.FC<InvoiceTableRowProps> = ({
                                                                    invoice,
                                                                    onView,
                                                                    onPost,
                                                                    popoverOpen,
                                                                    onPopoverChange,
                                                                }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 font-medium text-xs">
                            {invoice.invoiceNumber.split('-').pop()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(invoice.invoiceDate)}</p>
                        {invoice.periodName && (
                            <Badge variant="outline" className="text-[10px] mt-0.5">
                                {invoice.periodName}
                            </Badge>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{invoice.customerName}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(invoice.invoiceDate)}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">
                {formatCurrency(invoice.totalAmount)}
            </td>
            <td className="px-4 py-3 text-sm font-medium text-right">
                <span className={invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(invoice.balanceDue)}
                </span>
            </td>
            <td className="px-4 py-3">
                <Badge className={`flex items-center gap-1 ${getStatusBadge(invoice.status)}`}>
                    {getStatusIcon(invoice.status)}
                    {invoice.status.replace('_', ' ')}
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
                                onClick={() => onView(invoice)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                            >
                                <Eye size={16} className="text-blue-500" />
                                View Details
                            </button>
                            {invoice.status === 'Draft' && (
                                <button
                                    onClick={() => onPost(invoice)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-green-600 flex items-center gap-2"
                                >
                                    <Send size={16} />
                                    Post to GL
                                </button>
                            )}
                            {invoice.status === 'Posted' && (
                                <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-400 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Already Posted
                                </button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </td>
        </tr>
    );
};