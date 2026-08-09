// src/pages/finance/ap/components/VoucherLineItem.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';
import { VoucherLine } from '../types/voucher.types';

interface VoucherLineItemProps {
    line: VoucherLine;
    index: number;
    accounts: any[];
    onUpdate: (index: number, field: keyof VoucherLine, value: any) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
    errors?: Record<string, string>;
}

export const VoucherLineItem: React.FC<VoucherLineItemProps> = ({
                                                                    line,
                                                                    index,
                                                                    accounts,
                                                                    onUpdate,
                                                                    onRemove,
                                                                    canRemove,
                                                                    errors = {},
                                                                }) => {
    return (
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
            <div className="flex-1 min-w-[120px]">
                <Select
                    value={line.accountId}
                    onValueChange={(value) => onUpdate(index, 'accountId', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((acc) => (
                            <SelectItem key={acc.id || acc.accountId} value={acc.id || acc.accountId}>
                                {acc.code || acc.accountCode} - {acc.name || acc.accountName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors[`line_${index}_account`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`line_${index}_account`]}</p>
                )}
            </div>
            <div className="flex-1">
                <Input
                    value={line.description}
                    onChange={(e) => onUpdate(index, 'description', e.target.value)}
                    placeholder="Description"
                />
            </div>
            <div className="w-28">
                <Input
                    type="number"
                    step="0.01"
                    value={line.debitAmount || ''}
                    onChange={(e) => onUpdate(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                    placeholder="Debit"
                    className="text-blue-600"
                />
            </div>
            <div className="w-28">
                <Input
                    type="number"
                    step="0.01"
                    value={line.creditAmount || ''}
                    onChange={(e) => onUpdate(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                    placeholder="Credit"
                    className="text-orange-600"
                />
            </div>
            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
};