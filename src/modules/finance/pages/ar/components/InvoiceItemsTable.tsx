// src/pages/finance/ar/components/InvoiceItemsTable.tsx
import React from 'react';
import type { InvoiceItem } from '@/modules/finance/pages/ar/types/invoice.types';
import { formatCurrency } from '@/modules/finance/pages/ar/utils/invoice.utils';

interface InvoiceItemsTableProps {
    items: InvoiceItem[];
    totalAmount: number;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ items, totalAmount }) => {
    return (
        <div>
            <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Description</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-medium">Qty</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-medium">Unit Price</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-medium">Total</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="px-3 py-2">{item.description || 'N/A'}</td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                    <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-bold">Total:</td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-600">
                            {formatCurrency(totalAmount)}
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};