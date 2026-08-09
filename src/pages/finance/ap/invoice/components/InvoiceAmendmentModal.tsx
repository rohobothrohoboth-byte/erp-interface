// src/pages/finance/ap/invoice/components/InvoiceAmendmentModal.tsx

import React, { useState } from 'react';
import { Edit, AlertCircle } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Textarea } from '../../../../../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import type{ Invoice } from '../types/invoice.types';
import { formatCurrency } from '../utils/invoice.utils';

interface InvoiceAmendmentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice | null;
    amendmentReasons: readonly string[];
    onConfirm: (data: {
        invoiceId: string;
        reason: string;
        requestedSubTotal: number;
        requestedTaxAmount: number;
        requestedTotalAmount: number;
        comment: string;
    }) => void;
}

export const InvoiceAmendmentModal: React.FC<InvoiceAmendmentModalProps> = ({
                                                                                isOpen,
                                                                                onOpenChange,
                                                                                invoice,
                                                                                amendmentReasons,
                                                                                onConfirm,
                                                                            }) => {
    const [formData, setFormData] = useState({
        reason: '',
        requestedSubTotal: invoice?.subTotal || 0,
        requestedTaxAmount: invoice?.taxAmount || 0,
        requestedTotalAmount: invoice?.totalAmount || 0,
        comment: '',
    });

    if (!invoice) return null;

    const handleSubTotalChange = (value: number) => {
        const tax = value * 0.15;
        const total = value + tax;
        setFormData({ ...formData, requestedSubTotal: value, requestedTaxAmount: tax, requestedTotalAmount: total });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <Edit className="h-5 w-5" />
                        Request Invoice Amendment
                    </DialogTitle>
                    <DialogDescription>
                        Request changes to a posted/paid invoice. This requires approval.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm font-medium text-gray-700">
                            Invoice: {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                            Current Status: {invoice.status}
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                            <div>
                                <span className="text-gray-500">SubTotal:</span>
                                <span className="font-medium">{formatCurrency(invoice.subTotal)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Tax:</span>
                                <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Total:</span>
                                <span className="font-medium text-indigo-600">{formatCurrency(invoice.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Reason for Amendment *</Label>
                        <Select
                            value={formData.reason}
                            onValueChange={(value) => setFormData({ ...formData, reason: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {amendmentReasons.map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {reason}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs text-gray-500">New SubTotal</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.requestedSubTotal}
                                onChange={(e) => handleSubTotalChange(parseFloat(e.target.value) || 0)}
                                className="h-9"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">New Tax</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.requestedTaxAmount}
                                className="h-9 bg-gray-100"
                                disabled
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">New Total</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.requestedTotalAmount}
                                className="h-9 font-bold text-indigo-600"
                                disabled
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Comments (Optional)</Label>
                        <Textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Add any additional comments..."
                            rows={2}
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        This amendment will require approval before the invoice is updated.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                            onConfirm({
                                invoiceId: invoice.id,
                                reason: formData.reason,
                                requestedSubTotal: formData.requestedSubTotal,
                                requestedTaxAmount: formData.requestedTaxAmount,
                                requestedTotalAmount: formData.requestedTotalAmount,
                                comment: formData.comment,
                            });
                            onOpenChange(false);
                        }}
                        disabled={!formData.reason}
                    >
                        Submit Amendment Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};