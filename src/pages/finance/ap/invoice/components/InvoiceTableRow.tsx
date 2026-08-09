// src/pages/finance/ap/invoice/components/InvoiceTableRow.tsx

import React from 'react';
import { Eye, Edit, Trash2, Building2, User } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import type{ Invoice } from '../types/invoice.types';
import { formatCurrency, formatDate, getStatusColor, getTypeBadge } from '../utils/invoice.utils';

interface InvoiceTableRowProps {
    invoice: Invoice;
    onView: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onDelete: (invoice: Invoice) => void;
    canEdit: boolean;
}

export const InvoiceTableRow: React.FC<InvoiceTableRowProps> = ({
                                                                    invoice,
                                                                    onView,
                                                                    onEdit,
                                                                    onDelete,
                                                                    canEdit,
                                                                }) => {
    const getPartyName = (inv: Invoice): string => {
        if (inv.invoiceType === 'Purchase') {
            return inv.vendorName || 'Unknown Vendor';
        }
        return inv.customerName || 'Unknown Customer';
    };

    const getPartyIcon = (inv: Invoice) => {
        if (inv.invoiceType === 'Purchase') {
            return <Building2 className="h-4 w-4 text-gray-400" />;
        }
        return <User className="h-4 w-4 text-gray-400" />;
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-sm font-mono text-gray-900">{invoice.invoiceNumber}</td>
            <td className="px-4 py-3">
                <Badge className={getTypeBadge(invoice.invoiceType)}>
                    {invoice.invoiceType === 'Purchase' ? 'AP - Purchase' : 'AR - Sales'}
                </Badge>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    {getPartyIcon(invoice)}
                    {getPartyName(invoice)}
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.invoiceDate)}</td>
            <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                {formatCurrency(invoice.totalAmount)}
            </td>
            <td className={`px-4 py-3 text-sm text-right font-medium ${(invoice.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(invoice.balanceDue || 0)}
            </td>
            <td className="px-4 py-3">
                <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                </Badge>
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onView(invoice)}
                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye size={16} className="text-blue-500" />
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => onEdit(invoice)}
                            className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Edit Invoice"
                        >
                            <Edit size={16} className="text-yellow-600" />
                        </button>
                    )}
                    {invoice.status === 'Draft' && (
                        <button
                            onClick={() => onDelete(invoice)}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Invoice"
                        >
                            <Trash2 size={16} className="text-red-500" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};