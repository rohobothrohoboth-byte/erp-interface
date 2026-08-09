// src/pages/finance/ar/components/InvoicePostModal.tsx
import React from 'react';
import { Send, AlertCircle, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';
import type{ SalesInvoice, PostingData } from '../types/invoice.types';
import { formatCurrency } from '../utils/invoice.utils';

interface InvoicePostModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: SalesInvoice | null;
    postingData: PostingData;
    onPostingDataChange: (data: Partial<PostingData>) => void;
    onConfirm: () => void;
    isPosting: boolean;
    accounts: any[];
    periods: any[];
}

export const InvoicePostModal: React.FC<InvoicePostModalProps> = ({
                                                                      isOpen,
                                                                      onOpenChange,
                                                                      invoice,
                                                                      postingData,
                                                                      onPostingDataChange,
                                                                      onConfirm,
                                                                      isPosting,
                                                                      accounts,
                                                                      periods,
                                                                  }) => {
    if (!invoice) return null;

    const selectedPeriod = periods.find(p => p.id === postingData.periodId);
    const isPeriodClosed = selectedPeriod?.isClosed || false;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600">
                        <Send className="h-5 w-5" />
                        Post Invoice to GL
                    </DialogTitle>
                    <DialogDescription>
                        Confirm posting of invoice to General Ledger.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">Invoice</p>
                                <p className="font-bold">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-gray-600">{invoice.customerName}</p>
                                {invoice.periodName && (
                                    <p className="text-xs text-indigo-600">Period: {invoice.periodName}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Amount</p>
                                <p className="text-xl font-bold text-indigo-600">{formatCurrency(invoice.totalAmount)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Period Selection */}
                        <div>
                            <Label className="text-sm font-medium">
                                Financial Period <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={postingData.periodId}
                                onValueChange={(value) => onPostingDataChange({ periodId: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((period) => (
                                        <SelectItem key={period.id} value={period.id}>
                                            {period.name} {period.isClosed ? '🔒' : '🔓'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isPeriodClosed && (
                                <p className="text-xs text-red-500 mt-1">⚠️ This period is closed. Cannot post to GL.</p>
                            )}
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Posting Date <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                value={postingData.postingDate}
                                onChange={(e) => onPostingDataChange({ postingDate: e.target.value })}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <Input
                                value={postingData.description}
                                onChange={(e) => onPostingDataChange({ description: e.target.value })}
                                placeholder="Journal entry description"
                                className="mt-1"
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Journal Entry Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Accounts Receivable</span>
                                    <Select
                                        value={postingData.receivableAccountId}
                                        onValueChange={(value) => onPostingDataChange({ receivableAccountId: value })}
                                    >
                                        <SelectTrigger className="w-48 h-8">
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts
                                                .filter((a: any) => a.accountType === 'Asset')
                                                .map((acc: any) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.code} - {acc.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Revenue Account</span>
                                    <Select
                                        value={postingData.revenueAccountId}
                                        onValueChange={(value) => onPostingDataChange({ revenueAccountId: value })}
                                    >
                                        <SelectTrigger className="w-48 h-8">
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts
                                                .filter((a: any) => a.accountType === 'Revenue')
                                                .map((acc: any) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.code} - {acc.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {invoice.taxAmount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Tax Account</span>
                                        <Select
                                            value={postingData.taxAccountId}
                                            onValueChange={(value) => onPostingDataChange({ taxAccountId: value })}
                                        >
                                            <SelectTrigger className="w-48 h-8">
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts
                                                    .filter((a: any) => a.accountType === 'Liability')
                                                    .map((acc: any) => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            {acc.code} - {acc.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={postingData.createJournalEntry}
                                onChange={(e) => onPostingDataChange({ createJournalEntry: e.target.checked })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label className="text-sm font-medium text-gray-700">Create Journal Entry</Label>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Warning!</p>
                            <p>Posting will create a journal entry in the General Ledger. This action cannot be undone.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={onConfirm}
                        disabled={isPosting || isPeriodClosed || !postingData.periodId}
                    >
                        {isPosting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Post Invoice
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};