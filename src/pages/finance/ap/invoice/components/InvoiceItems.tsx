// src/pages/finance/ap/invoice/components/InvoiceItems.tsx

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import type{ InvoiceItem } from '../types/invoice.types';
import { formatCurrency } from '../utils/invoice.utils';

interface InvoiceItemsProps {
    items: InvoiceItem[];
    onUpdateItem: (index: number, field: keyof InvoiceItem, value: any) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    disabled?: boolean;
    readOnly?: boolean;
    showTotals?: boolean;
}

export const InvoiceItems: React.FC<InvoiceItemsProps> = ({
                                                              items,
                                                              onUpdateItem,
                                                              onAddItem,
                                                              onRemoveItem,
                                                              disabled = false,
                                                              readOnly = false,
                                                              showTotals = true,
                                                          }) => {
    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subTotal * 0.15;
    const totalAmount = subTotal + taxAmount;

    if (readOnly) {
        return (
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Invoice Items</h4>
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
                        {showTotals && (
                            <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan={3} className="px-3 py-2 text-right font-bold">Sub Total:</td>
                                <td className="px-3 py-2 text-right font-bold">{formatCurrency(subTotal)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="px-3 py-2 text-right font-bold">Tax (15%):</td>
                                <td className="px-3 py-2 text-right font-bold">{formatCurrency(taxAmount)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="px-3 py-2 text-right font-bold">Total:</td>
                                <td className="px-3 py-2 text-right font-bold text-indigo-600">
                                    {formatCurrency(totalAmount)}
                                </td>
                            </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <Label className="text-base font-semibold">Invoice Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={onAddItem} disabled={disabled}>
                    <Plus size={14} className="mr-1" /> Add Item
                </Button>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {items.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 border-2 border-dashed rounded-lg">
                        No items added
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-[3]">
                                <Input
                                    value={item.description}
                                    onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                                    placeholder="Description"
                                    className="h-9"
                                    disabled={disabled}
                                />
                            </div>
                            <div className="w-20">
                                <Input
                                    type="number"
                                    value={item.quantity || ''}
                                    onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    placeholder="Qty"
                                    className="h-9"
                                    disabled={disabled}
                                />
                            </div>
                            <div className="w-28">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={item.unitPrice || ''}
                                    onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    placeholder="Price"
                                    className="h-9"
                                    disabled={disabled}
                                />
                            </div>
                            <div className="w-28">
                                <Input
                                    value={formatCurrency(item.total || 0)}
                                    disabled
                                    className="h-9 bg-gray-100"
                                />
                            </div>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveItem(index)}
                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                                    disabled={disabled}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showTotals && items.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg space-y-1">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sub Total:</span>
                        <span className="text-sm font-medium">{formatCurrency(subTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax (15%):</span>
                        <span className="text-sm font-medium">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold">
                        <span>Total:</span>
                        <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};